package com.revolt.showroom.service;

public class StorageObjectNotFoundException extends RuntimeException {
    public StorageObjectNotFoundException(String key) {
        super("Storage object not found: " + key);
    }
}
