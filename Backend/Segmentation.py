from flask import Flask, request, send_file
import cv2
import numpy as np
from io import BytesIO
from PIL import Image

class Segmentation:
    def __init__(self):
        # Initialization logic if needed
        pass

    def process_image(self, img, segmentation):
        # Ensure the input image is in 3-channel BGR format
        if len(img.shape) == 2:  # if grayscale, convert to BGR
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        elif img.shape[2] == 4:  # if BGRA, convert to BGR
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

        # Convert image to grayscale for processing
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        ret, bin_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        bin_img = cv2.morphologyEx(bin_img, cv2.MORPH_OPEN, kernel, iterations=2)

        # Sure background area
        sure_bg = cv2.dilate(bin_img, kernel, iterations=3)

        # Distance transform
        dist = cv2.distanceTransform(bin_img, cv2.DIST_L2, 5)

        # Foreground area
        ret, sure_fg = cv2.threshold(dist, 0.5 * dist.max(), 255, cv2.THRESH_BINARY)
        sure_fg = sure_fg.astype(np.uint8)

        # Unknown area
        unknown = cv2.subtract(sure_bg, sure_fg)

        # Marker labeling
        ret, markers = cv2.connectedComponents(sure_fg)
        markers += 1
        markers[unknown == 255] = 0

        # Ensure markers are in the correct type (CV_32SC1)
        markers = markers.astype(np.int32)

        # Watershed Algorithm
        markers = cv2.watershed(img, markers)

        # Contour extraction
        labels = np.unique(markers)
        coins = []
        for label in labels[2:]:
            target = np.where(markers == label, 255, 0).astype(np.uint8)
            contours, _ = cv2.findContours(target, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            coins.append(contours[0])

        img_with_contours = cv2.drawContours(img.copy(), coins, -1, color=(0, 23, 223), thickness=2)
        return img_with_contours

