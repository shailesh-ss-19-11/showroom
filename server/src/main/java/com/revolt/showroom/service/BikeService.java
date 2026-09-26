package com.revolt.showroom.service;

import tools.jackson.databind.JsonNode;
import com.revolt.showroom.dto.*;
import com.revolt.showroom.entity.Bike;
import com.revolt.showroom.entity.BikeColor;
import com.revolt.showroom.entity.BikeImage;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.BikeColorRepository;
import com.revolt.showroom.repository.BikeImageRepository;
import com.revolt.showroom.repository.BikeRepository;
import com.revolt.showroom.spec.BikeSpecifications;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

import static com.revolt.showroom.util.ParseUtils.*;

@Service
public class BikeService {

    private final BikeRepository bikeRepository;
    private final BikeColorRepository bikeColorRepository;
    private final BikeImageRepository bikeImageRepository;
    private final StorageService storageService;
    private final PublicUrlService publicUrlService;

    public BikeService(
        BikeRepository bikeRepository,
        BikeColorRepository bikeColorRepository,
        BikeImageRepository bikeImageRepository,
        StorageService storageService,
        PublicUrlService publicUrlService
    ) {
        this.bikeRepository = bikeRepository;
        this.bikeColorRepository = bikeColorRepository;
        this.bikeImageRepository = bikeImageRepository;
        this.storageService = storageService;
        this.publicUrlService = publicUrlService;
    }

    @Transactional(readOnly = true)
    public List<BikeResponse> list(
        String brand, String category, String search, BigDecimal minPrice, BigDecimal maxPrice,
        Boolean featured, String sort, String status, boolean isAdmin
    ) {
        Boolean isActiveFilter;
        if (!isAdmin) {
            isActiveFilter = true;
        } else if ("active".equals(status)) {
            isActiveFilter = true;
        } else if ("inactive".equals(status)) {
            isActiveFilter = false;
        } else {
            isActiveFilter = null; // admin + "all"/omitted -> no filter
        }

        Sort sortOrder = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        return bikeRepository
            .findAll(BikeSpecifications.filter(isActiveFilter, brand, category, search, minPrice, maxPrice, featured), sortOrder)
            .stream()
            .map(BikeResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public BikeMetaResponse meta() {
        List<Bike> active = bikeRepository.findByIsActiveTrue();
        List<String> brands = active.stream().map(Bike::getBrand).distinct().sorted().toList();
        List<String> categories = active.stream().map(Bike::getCategory).distinct().sorted().toList();
        return new BikeMetaResponse(brands, categories);
    }

    @Transactional(readOnly = true)
    public BikeResponse get(UUID id, boolean isAdmin) {
        Bike bike = bikeRepository.findById(id).orElseThrow(() -> ApiException.notFound("Bike not found"));
        if (!bike.getIsActive() && !isAdmin) {
            throw ApiException.notFound("Bike not found");
        }
        return BikeResponse.from(bike);
    }

    @Transactional
    public BikeResponse create(
        String name, String brand, String category, String price,
        String batteryCapacityKwh, String rangeKm, String chargingTimeHours, String topSpeedKmph,
        String power, String description, String featured, List<MultipartFile> images
    ) {
        if (isBlank(name) || isBlank(brand) || isBlank(category) || isBlank(price)) {
            throw ApiException.badRequest("name, brand, category and price are required");
        }

        Bike bike = new Bike();
        bike.setName(name);
        bike.setBrand(brand);
        bike.setCategory(category);
        bike.setPrice(toBigDecimalOrNull(price));
        bike.setBatteryCapacityKwh(toDoubleOrNull(batteryCapacityKwh));
        bike.setRangeKm(toDoubleOrNull(rangeKm));
        bike.setChargingTimeHours(toDoubleOrNull(chargingTimeHours));
        bike.setTopSpeedKmph(toDoubleOrNull(topSpeedKmph));
        bike.setPower(power);
        bike.setDescription(description);
        bike.setFeatured(toBoolean(featured));

        List<BikeImage> uploaded = new ArrayList<>();
        if (images != null) {
            int index = 0;
            for (MultipartFile file : images) {
                if (file == null || file.isEmpty()) continue;
                String key = storageService.generateKey(file.getOriginalFilename());
                try {
                    storageService.uploadObject(key, file.getBytes(), file.getContentType());
                } catch (IOException e) {
                    throw new RuntimeException("Failed to read uploaded file", e);
                }
                BikeImage image = new BikeImage();
                image.setBike(bike);
                image.setUrl(publicUrlService.buildFileUrl(key));
                image.setPrimary(index == 0);
                image.setSortOrder(index);
                uploaded.add(image);
                index++;
            }
        }
        bike.getImages().addAll(uploaded);

        return BikeResponse.from(bikeRepository.save(bike));
    }

    /** JSON-body creation path — used by the admin "Add Bike" form, which has no file input of its own. */
    @Transactional
    public BikeResponse create(BikeCreateRequest request) {
        Bike bike = new Bike();
        bike.setName(request.name());
        bike.setBrand(request.brand());
        bike.setCategory(request.category());
        bike.setPrice(request.price());
        bike.setBatteryCapacityKwh(request.batteryCapacityKwh());
        bike.setRangeKm(request.rangeKm());
        bike.setChargingTimeHours(request.chargingTimeHours());
        bike.setTopSpeedKmph(request.topSpeedKmph());
        bike.setPower(request.power());
        bike.setDescription(request.description());
        bike.setFeatured(Boolean.TRUE.equals(request.featured()));
        return BikeResponse.from(bikeRepository.save(bike));
    }

    @Transactional
    public BikeImportResult importCsv(MultipartFile file) {
        String content;
        try {
            content = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw ApiException.badRequest("Could not read the uploaded file");
        }

        List<List<String>> rows = com.revolt.showroom.util.CsvParser.parse(content);
        if (rows.isEmpty()) {
            throw ApiException.badRequest("CSV file is empty");
        }

        Map<String, Integer> columns = new HashMap<>();
        List<String> header = rows.get(0);
        for (int i = 0; i < header.size(); i++) {
            columns.put(header.get(i).trim().toLowerCase(), i);
        }

        List<BikeImportRowError> errors = new ArrayList<>();
        List<Bike> toSave = new ArrayList<>();

        for (int r = 1; r < rows.size(); r++) {
            List<String> row = rows.get(r);
            if (row.size() == 1 && row.get(0).isBlank()) continue;

            String name = cell(row, columns, "name");
            String brand = cell(row, columns, "brand");
            String category = cell(row, columns, "category");
            String price = cell(row, columns, "price");

            if (isBlank(name) || isBlank(brand) || isBlank(category) || isBlank(price)) {
                errors.add(new BikeImportRowError(r + 1, "name, brand, category and price are required"));
                continue;
            }
            BigDecimal parsedPrice = toBigDecimalOrNull(price);
            if (parsedPrice == null) {
                errors.add(new BikeImportRowError(r + 1, "price must be a number"));
                continue;
            }

            Bike bike = new Bike();
            bike.setName(name);
            bike.setBrand(brand);
            bike.setCategory(category);
            bike.setPrice(parsedPrice);
            bike.setBatteryCapacityKwh(toDoubleOrNull(cell(row, columns, "batterycapacitykwh")));
            bike.setRangeKm(toDoubleOrNull(cell(row, columns, "rangekm")));
            bike.setChargingTimeHours(toDoubleOrNull(cell(row, columns, "chargingtimehours")));
            bike.setTopSpeedKmph(toDoubleOrNull(cell(row, columns, "topspeedkmph")));
            bike.setPower(cell(row, columns, "power"));
            bike.setDescription(cell(row, columns, "description"));
            bike.setFeatured(toBoolean(cell(row, columns, "featured")));
            String isActiveCell = cell(row, columns, "isactive");
            bike.setIsActive(isActiveCell == null || isActiveCell.isBlank() || toBoolean(isActiveCell));

            toSave.add(bike);
        }

        bikeRepository.saveAll(toSave);
        return new BikeImportResult(toSave.size(), errors);
    }

    private static String cell(List<String> row, Map<String, Integer> columns, String name) {
        Integer idx = columns.get(name);
        if (idx == null || idx >= row.size()) return null;
        String value = row.get(idx);
        return value == null || value.isBlank() ? null : value.trim();
    }

    @Transactional
    public BikeResponse update(UUID id, JsonNode body) {
        Bike bike = bikeRepository.findById(id).orElseThrow(() -> ApiException.notFound("Bike not found"));

        if (body.has("name")) bike.setName(body.get("name").asString());
        if (body.has("brand")) bike.setBrand(body.get("brand").asString());
        if (body.has("category")) bike.setCategory(body.get("category").asString());
        if (body.has("price")) bike.setPrice(new BigDecimal(body.get("price").asString()));
        if (body.has("batteryCapacityKwh")) bike.setBatteryCapacityKwh(nullableDouble(body.get("batteryCapacityKwh")));
        if (body.has("rangeKm")) bike.setRangeKm(nullableDouble(body.get("rangeKm")));
        if (body.has("chargingTimeHours")) bike.setChargingTimeHours(nullableDouble(body.get("chargingTimeHours")));
        if (body.has("topSpeedKmph")) bike.setTopSpeedKmph(nullableDouble(body.get("topSpeedKmph")));
        if (body.has("power")) bike.setPower(nullableText(body.get("power")));
        if (body.has("description")) bike.setDescription(nullableText(body.get("description")));
        if (body.has("featured")) bike.setFeatured(body.get("featured").asBoolean());
        if (body.has("isActive")) bike.setIsActive(body.get("isActive").asBoolean());

        return BikeResponse.from(bikeRepository.save(bike));
    }

    @Transactional
    public void delete(UUID id) {
        Bike bike = bikeRepository.findById(id).orElseThrow(() -> ApiException.notFound("Bike not found"));
        List<String> keys = bike.getImages().stream().map(img -> storageService.keyFromUrl(img.getUrl())).filter(Objects::nonNull).toList();
        bikeRepository.delete(bike);
        keys.forEach(storageService::deleteObject);
    }

    @Transactional
    public BulkActionResult bulkUpdate(BulkActionRequest request) {
        if (request.ids() == null || request.ids().isEmpty()) {
            throw ApiException.badRequest("ids must be a non-empty array");
        }

        List<Bike> bikes = bikeRepository.findAllById(request.ids());

        if ("delete".equals(request.action())) {
            List<String> keys = bikes.stream()
                .flatMap(b -> b.getImages().stream())
                .map(img -> storageService.keyFromUrl(img.getUrl()))
                .filter(Objects::nonNull)
                .toList();
            bikeRepository.deleteAll(bikes);
            keys.forEach(storageService::deleteObject);
            return new BulkActionResult(bikes.size());
        }

        for (Bike bike : bikes) {
            switch (request.action() == null ? "" : request.action()) {
                case "feature" -> bike.setFeatured(true);
                case "unfeature" -> bike.setFeatured(false);
                case "publish" -> bike.setIsActive(true);
                case "unpublish" -> bike.setIsActive(false);
                default -> throw ApiException.badRequest("action must be one of feature, unfeature, publish, unpublish, delete");
            }
        }
        bikeRepository.saveAll(bikes);
        return new BulkActionResult(bikes.size());
    }

    @Transactional
    public BikeResponse duplicate(UUID id) {
        Bike original = bikeRepository.findById(id).orElseThrow(() -> ApiException.notFound("Bike not found"));

        Bike copy = new Bike();
        copy.setName(original.getName() + " (Copy)");
        copy.setBrand(original.getBrand());
        copy.setCategory(original.getCategory());
        copy.setPrice(original.getPrice());
        copy.setBatteryCapacityKwh(original.getBatteryCapacityKwh());
        copy.setRangeKm(original.getRangeKm());
        copy.setChargingTimeHours(original.getChargingTimeHours());
        copy.setTopSpeedKmph(original.getTopSpeedKmph());
        copy.setPower(original.getPower());
        copy.setDescription(original.getDescription());
        copy.setFeatured(false);
        copy.setIsActive(false);

        for (BikeColor color : original.getColors()) {
            BikeColor newColor = new BikeColor();
            newColor.setBike(copy);
            newColor.setName(color.getName());
            newColor.setHexCode(color.getHexCode());
            copy.getColors().add(newColor);
        }

        return BikeResponse.from(bikeRepository.save(copy));
    }

    @Transactional
    public BikeColorResponse addColor(UUID bikeId, ColorRequest request) {
        Bike bike = bikeRepository.findById(bikeId).orElseThrow(() -> ApiException.notFound("Bike not found"));
        BikeColor color = new BikeColor();
        color.setBike(bike);
        color.setName(request.name());
        color.setHexCode(request.hexCode());
        bike.getColors().add(color);
        color = bikeColorRepository.save(color);
        return BikeColorResponse.from(color);
    }

    @Transactional
    public void deleteColor(UUID bikeId, UUID colorId) {
        BikeColor color = bikeColorRepository.findById(colorId)
            .filter(c -> c.getBike().getId().equals(bikeId))
            .orElseThrow(() -> ApiException.notFound("Color not found"));
        bikeColorRepository.delete(color);
    }

    @Transactional
    public BikeImageResponse addImage(UUID bikeId, ImageAddRequest request) {
        Bike bike = bikeRepository.findById(bikeId).orElseThrow(() -> ApiException.notFound("Bike not found"));

        boolean isPrimary = Boolean.TRUE.equals(request.isPrimary());
        if (isPrimary) {
            bike.getImages().forEach(img -> img.setPrimary(false));
        }

        BikeImage image = new BikeImage();
        image.setBike(bike);
        image.setUrl(request.url());
        image.setPrimary(isPrimary);
        image.setSortOrder(bike.getImages().size());
        if (request.colorId() != null) {
            BikeColor color = bikeColorRepository.findById(request.colorId())
                .filter(c -> c.getBike().getId().equals(bikeId))
                .orElse(null);
            image.setColor(color);
        }
        bike.getImages().add(image);
        image = bikeImageRepository.save(image);
        return BikeImageResponse.from(image);
    }

    @Transactional
    public BikeResponse reorderImages(UUID bikeId, List<UUID> order) {
        if (order == null || order.isEmpty()) {
            throw ApiException.badRequest("order must be a non-empty array of image ids");
        }
        List<BikeImage> images = bikeImageRepository.findByIdInAndBikeId(order, bikeId);
        Map<UUID, BikeImage> byId = new HashMap<>();
        images.forEach(img -> byId.put(img.getId(), img));

        for (int i = 0; i < order.size(); i++) {
            BikeImage image = byId.get(order.get(i));
            if (image != null) image.setSortOrder(i);
        }
        bikeImageRepository.saveAll(images);

        Bike bike = bikeRepository.findById(bikeId).orElseThrow(() -> ApiException.notFound("Bike not found"));
        return BikeResponse.from(bike);
    }

    @Transactional
    public void deleteImage(UUID bikeId, UUID imageId) {
        BikeImage image = bikeImageRepository.findById(imageId)
            .filter(img -> img.getBike().getId().equals(bikeId))
            .orElseThrow(() -> ApiException.notFound("Image not found"));
        String key = storageService.keyFromUrl(image.getUrl());
        bikeImageRepository.delete(image);
        if (key != null) storageService.deleteObject(key);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static Double nullableDouble(JsonNode node) {
        return node.isNull() ? null : node.asDouble();
    }

    private static String nullableText(JsonNode node) {
        return node.isNull() ? null : node.asString();
    }
}
