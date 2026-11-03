import QRCode from "qrcode";

/** spec-004 R6: QR de la acreditación como data URL PNG (corrección M). */
export function qrDataUrl(codigo: string): Promise<string> {
  return QRCode.toDataURL(codigo, { errorCorrectionLevel: "M", margin: 1, width: 280 });
}
