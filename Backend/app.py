from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageOps
import io
import base64

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

def adjust_hue(image, hue_factor):
    # Convert image to HSV
    image = image.convert('HSV')
    data = list(image.getdata())
    data = [(int((pixel[0] + hue_factor * 255) % 255), pixel[1], pixel[2]) for pixel in data]
    image.putdata(data)
    return image.convert('RGB')

def adjust_saturation(image, saturation_factor):
    enhancer = ImageEnhance.Color(image)
    return enhancer.enhance(saturation_factor)

def adjust_lightness(image, lightness_factor):
    enhancer = ImageEnhance.Brightness(image)
    return enhancer.enhance(lightness_factor)

if __name__ == "__main__":
    app.run(debug=True)
