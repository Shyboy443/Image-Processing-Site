import easyocr
import numpy as np
import cv2
from PIL import Image

class imageText:
    def __init__(self, languages=['en']):
        self.reader = easyocr.Reader(languages)

    def extract_text_from_image(self, image_bytes):
        image = Image.open(image_bytes)
        image_np = np.array(image)
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        results = self.reader.readtext(image_bgr, detail=0)

        extracted_text = "\n".join(results)
        return extracted_text
