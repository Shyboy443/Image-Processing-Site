from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageOps
import io
import base64
import colorsys

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

@app.route('/upload', methods=['POST'])
def upload_image():
    # Get the image from the request
    file = request.files['image']
    image = Image.open(file.stream)

    # Get parameters from the request
    brightness = float(request.form.get('brightness', 1.0))
    color_mode = request.form.get('color_mode', 'color')
    flip = request.form.get('flip', None)
    hue = float(request.form.get('hue', 0))
    saturation = float(request.form.get('saturation', 1))
    lightness = float(request.form.get('lightness', 1))
    crop = request.form.get('crop', 'false') == 'true'
    crop_width = int(request.form.get('crop_width', 0))
    crop_height = int(request.form.get('crop_height', 0))
    min_tone = float(request.form.get('min_tone', 0))
    max_tone = float(request.form.get('max_tone', 255))
    gamma = float(request.form.get('gamma', 1.0))
    red = float(request.form.get('red', 1.0))
    green = float(request.form.get('green', 1.0))
    blue = float(request.form.get('blue', 1.0))
    rotation_angle = float(request.form.get('rotation', 0))

    # Adjust brightness
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(brightness)

    # Apply color transformations
    if color_mode == 'grayscale':
        image = ImageOps.grayscale(image)
    elif color_mode == 'bw':
        image = image.convert('L').point(lambda x: 0 if x < 128 else 255, '1')

    # Apply hue, saturation, and lightness adjustments
    image = adjust_hue(image, hue)
    image = adjust_saturation(image, saturation)
    image = adjust_lightness(image, lightness)
    
    if rotation_angle:
        image = image.rotate(360.0-rotation_angle, expand=True)

    # Apply RGB adjustments
    image = adjust_rgb(image, red, green, blue)

    # Apply tonal range adjustment
    image = adjust_tonal_range(image, min_tone, max_tone)

    # Apply gamma correction
    image = adjust_gamma(image, gamma)

    # Apply cropping if specified
    if crop and crop_width > 0 and crop_height > 0:
        width, height = image.size
        left = (width - crop_width) / 2
        top = (height - crop_height) / 2
        right = (width + crop_width) / 2
        bottom = (height + crop_height) / 2
        image = image.crop((left, top, right, bottom))

    # Apply flipping
    if flip == 'horizontal':
        image = ImageOps.mirror(image)
    elif flip == 'vertical':
        image = ImageOps.flip(image)

    # Save processed image to a byte buffer
    byte_io = io.BytesIO()
    image.save(byte_io, 'PNG')
    byte_io.seek(0)

    # Encode the image in base64 to send it back to the frontend
    base64_image = base64.b64encode(byte_io.getvalue()).decode('utf-8')

    # Return the base64-encoded image
    return jsonify({"image": base64_image, "message": "Image processed successfully"}), 200

@app.route('/upload-cropped-image', methods=['POST'])
def upload_cropped_image():
    # Get the cropped image from the request
    cropped_file = request.files['croppedImage']
    cropped_image = Image.open(cropped_file.stream)

    # Further processing can be done on the cropped_image if needed
    # ...

    # Save processed image to a byte buffer
    byte_io = io.BytesIO()
    cropped_image.save(byte_io, 'PNG')
    byte_io.seek(0)

    # Encode the image in base64 to send it back to the frontend
    base64_image = base64.b64encode(byte_io.getvalue()).decode('utf-8')

    # Return the base64-encoded cropped image
    return jsonify({"image": base64_image, "message": "Cropped image processed successfully"}), 200

def adjust_hue(image, hue_factor):
    """Adjust the hue of the image."""
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    pixels = image.load()
    for i in range(image.width):
        for j in range(image.height):
            r, g, b = pixels[i, j]
            h, s, v = colorsys.rgb_to_hsv(r / 255., g / 255., b / 255.)
            h = (h + hue_factor / 360.0) % 1.0
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            pixels[i, j] = (int(r * 255), int(g * 255), int(b * 255))
    return image

def adjust_saturation(image, saturation_factor):
    enhancer = ImageEnhance.Color(image)
    return enhancer.enhance(saturation_factor)

def adjust_lightness(image, lightness_factor):
    enhancer = ImageEnhance.Brightness(image)
    return enhancer.enhance(lightness_factor)

def adjust_tonal_range(image, min_tone, max_tone):
    """Adjust the tonal range of the image."""
    if image.mode != 'RGB':
        image = image.convert('RGB')

    min_tone = max(0.0, min_tone)
    max_tone = min(255.0, max_tone)

    if min_tone >= max_tone:
        min_tone = 0.0
        max_tone = 255.0

    pixels = image.load()
    for i in range(image.width):
        for j in range(image.height):
            r, g, b = pixels[i, j]
            r = int((r - min_tone) / (max_tone - min_tone) * 255)
            g = int((g - min_tone) / (max_tone - min_tone) * 255)
            b = int((b - min_tone) / (max_tone - min_tone) * 255)
            pixels[i, j] = (min(max(r, 0), 255), min(max(g, 0), 255), min(max(b, 0), 255))

    return image

def adjust_gamma(image, gamma):
    """Adjust the gamma of the image."""
    if image.mode != 'RGB':
        image = image.convert('RGB')

    lookup_table = [int(255 * (i / 255) ** gamma) for i in range(256)]

    def gamma_correct(pixel):
        return tuple(lookup_table[color] for color in pixel)

    pixels = image.load()
    for i in range(image.width):
        for j in range(image.height):
            pixels[i, j] = gamma_correct(pixels[i, j])
    return image

def adjust_rgb(image, red_factor, green_factor, blue_factor):
    """Adjust the red, green, and blue channels of the image."""
    if image.mode != 'RGB':
        image = image.convert('RGB')

    pixels = image.load()
    for i in range(image.width):
        for j in range(image.height):
            r, g, b = pixels[i, j]
            r = int(r * red_factor)
            g = int(g * green_factor)
            b = int(b * blue_factor)
            pixels[i, j] = (min(max(r, 0), 255), min(max(g, 0), 255), min(max(b, 0), 255))
    return image

if __name__ == "__main__":
    app.run(debug=True)
