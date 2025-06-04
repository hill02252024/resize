import JSZip from "jszip";
import { saveAs } from "file-saver";

document.getElementById("resizeBtn").addEventListener("click", async () => {
  const input = document.getElementById("imageInput");
  const scale = parseInt(document.getElementById("scaleInput").value) / 100;
  const status = document.getElementById("status");
  status.textContent = "Processing...";

  if (!input.files.length) {
    alert("Please upload images.");
    return;
  }

  const zip = new JSZip();

  for (let file of input.files) {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");

    canvas.width = imageBitmap.width * scale;
    canvas.height = imageBitmap.height * scale;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
    zip.file(file.name, blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "resized_images.zip");
  status.textContent = "Download ready!";
});
