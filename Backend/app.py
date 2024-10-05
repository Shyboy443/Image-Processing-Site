from flask import Flask, request, jsonify,send_file
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageOps
import io
import base64
import colorsys
import numpy as np
import cv2
from imageText import imageText
from Segmentation import Segmentation
from io import BytesIO


segmentation = Segmentation()

app = Flask(__name__)
CORS(app)  

def process_image(image, params):
    """Process the image based on provided parameters."""

    if params['segmentation']:
        image_array = np.array(image)
        image_array = segmentation.process_image(image_array, True)
        image = Image.fromarray(cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB))
    

    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(params['brightness'])
 
    if params['color_mode'] == 'grayscale':
        image = ImageOps.grayscale(image)
    elif params['color_mode'] == 'bw':
        image = image.convert('L').point(lambda x: 0 if x < 128 else 255, '1')

    image = adjust_hue(image, params['hue'])
    image = adjust_saturation(image, params['saturation'])
    image = adjust_lightness(image, params['lightness'])
    
 
    if params['rotation']:
        image = image.rotate(360.0 - params['rotation'], expand=True)


    image = adjust_rgb(image, params['red'], params['green'], params['blue'])

 
    image = adjust_tonal_range(image, params['min_tone'], params['max_tone'])

    image = adjust_gamma(image, params['gamma'])


    if params['crop']:
        image = crop_image(image, params['crop_width'], params['crop_height'])


      
    if params['colorBalance']:
      
        image = auto_color_balance(image)
    else:
        image = adjust_rgb(image, params['red'], params['green'], params['blue'])

    if params['flip'] == 'horizontal':
        image = ImageOps.mirror(image)
    elif params['flip'] == 'vertical':
        image = ImageOps.flip(image)



    if params['edge_detection']:
        image = edge_detection_filter(image)
    
    if params['emboss']:
        image = emboss_filter(image)   

    return image




@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    image = Image.open(file.stream)
    
    params = {
        'brightness': float(request.form.get('brightness', 1.0)),
        'color_mode': request.form.get('color_mode', 'color'),
        'flip': request.form.get('flip', None),
        'hue': float(request.form.get('hue', 0)),
        'saturation': float(request.form.get('saturation', 1)),
        'lightness': float(request.form.get('lightness', 1)),
        'crop': request.form.get('crop', 'false') == 'true',
        'crop_width': int(request.form.get('crop_width', 0)),
        'crop_height': int(request.form.get('crop_height', 0)),
        'min_tone': float(request.form.get('min_tone', 0)),
        'max_tone': float(request.form.get('max_tone', 255)),
        'gamma': float(request.form.get('gamma', 1.0)),
        'red': float(request.form.get('red', 1.0)),
        'green': float(request.form.get('green', 1.0)),
        'blue': float(request.form.get('blue', 1.0)),
        'rotation': float(request.form.get('rotation', 0)),
        'colorBalance': request.form.get('colorBalance', 'false').lower() == 'true',
        'segmentation': request.form.get('segmentation', 'false').lower() == 'true',  
        'edge_detection': request.form.get('edgeDetection', 'false').lower() == 'true',
        'emboss': request.form.get('emboss', 'false').lower() == 'true'


    }
    
    print(params['colorBalance'])

    image = process_image(image, params)

  
    byte_io = io.BytesIO()
    image.save(byte_io, 'PNG')
    byte_io.seek(0)

    base64_image = base64.b64encode(byte_io.getvalue()).decode('utf-8')

    return jsonify({"image": base64_image, "message": "Image processed successfully"}), 200

@app.route('/upload-cropped-image', methods=['POST'])


def upload_cropped_image():
    cropped_file = request.files['croppedImage']
    cropped_image = Image.open(cropped_file.stream)
    
  
    byte_io = io.BytesIO()
    cropped_image.save(byte_io, 'PNG')
    byte_io.seek(0)

 
    base64_image = base64.b64encode(byte_io.getvalue()).decode('utf-8')

    return jsonify({"image": base64_image, "message": "Cropped image processed successfully"}), 200

def auto_color_balance(image):
    """Automatically balance the colors of the image using advanced techniques."""
    if image.mode != 'RGB':
        image = image.convert('RGB')

 
    img_array = np.array(image)

 
    def apply_clahe(channel):
        clahe = cv2.createCLAHE(clipLimit=1.0, tileGridSize=(8, 8))
        return clahe.apply(channel)


    r, g, b = [apply_clahe(img_array[:, :, i]) for i in range(3)]

    img_array = np.stack((r, g, b), axis=-1)

    balanced_image = Image.fromarray(img_array)

 
    balanced_image = ImageEnhance.Brightness(balanced_image).enhance(1.01)
    balanced_image = ImageEnhance.Contrast(balanced_image).enhance(1.03)  
    balanced_image = ImageEnhance.Color(balanced_image).enhance(1.3)      


    img_array = cv2.GaussianBlur(np.array(balanced_image), (3, 3), 0)
    balanced_image = Image.fromarray(img_array)

    return balanced_image


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

def crop_image(image, crop_width, crop_height):
    """Crop the image to the specified dimensions."""
    width, height = image.size
    left = (width - crop_width) / 2
    top = (height - crop_height) / 2
    right = (width + crop_width) / 2
    bottom = (height + crop_height) / 2
    return image.crop((left, top, right, bottom))



def edge_detection_filter(image):
    image_array = np.array(image)
    edges = cv2.Canny(image_array, 100, 200)
    return Image.fromarray(cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB))

def emboss_filter(image):
    image_array = np.array(image)
    kernel = np.array([[0, -1, -1], [1, 0, -1], [1, 1, 0]], dtype='int')
    embossed_image = cv2.filter2D(image_array, -1, kernel)
    return Image.fromarray(embossed_image)

#Image Text Section
imageText = imageText(languages=['en'])

@app.route('/extract-text', methods=['POST'])
def extract_text():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    image_file = request.files['image']
   
    image_bytes = io.BytesIO(image_file.read())

    extracted_text = imageText.extract_text_from_image(image_bytes)

    return jsonify({'text': extracted_text})


if __name__ == "__main__":
    app.run(debug=True, threaded=True)  # Enable threading for concurrent requests



