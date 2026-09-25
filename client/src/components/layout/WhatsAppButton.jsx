const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

export default function WhatsAppButton({ message = "Hi, I'm interested in your bikes." }) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.696 4.607 1.897 6.475L4 29l7.72-1.858A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.6a9.55 9.55 0 0 1-4.87-1.334l-.35-.208-3.606.868.897-3.606-.229-.37A9.56 9.56 0 1 1 25.56 15a9.57 9.57 0 0 1-9.559 9.6Zm5.243-7.152c-.287-.144-1.698-.838-1.962-.934-.263-.096-.455-.144-.646.144-.192.287-.742.934-.91 1.126-.168.192-.335.216-.622.072-.287-.144-1.212-.447-2.31-1.427-.854-.762-1.43-1.703-1.598-1.99-.168-.287-.018-.442.126-.585.13-.129.287-.335.43-.503.144-.168.192-.287.288-.479.096-.192.048-.359-.024-.503-.072-.144-.646-1.557-.886-2.132-.233-.56-.47-.484-.646-.493-.167-.009-.359-.011-.551-.011-.192 0-.503.072-.766.36-.263.287-1.004.981-1.004 2.393s1.028 2.776 1.171 2.968c.144.192 2.023 3.09 4.902 4.334.685.296 1.219.472 1.635.604.687.219 1.312.188 1.806.114.551-.082 1.698-.694 1.938-1.364.24-.67.24-1.244.168-1.364-.072-.12-.263-.192-.55-.336Z" />
      </svg>
    </a>
  );
}
