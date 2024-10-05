import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import cv2
import matplotlib.pyplot as plt
from tkinter import filedialog
import tkinter as tk

def cartoonize_image_ai(image):
    # Load the pre-trained CartoonGAN model from TensorFlow Hub
    model_url = "https://tfhub.dev/sayakpaul/lite-model/cartoongan/int8/1"
    model = hub.load(model_url)
    
    # Preprocess the image for the model
    img_resized = cv2.resize(image, (256, 256))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img = img_rgb / 255.0  # Normalize to [0,1]
    
    # Add batch dimension and convert to tensor
    img_tensor = tf.convert_to_tensor([img], dtype=tf.float32)
    
    # Apply the model to the image
    cartoonized_img = model(img_tensor)[0]
    
    # Convert the output back to a NumPy array
    cartoonized_img = cartoonized_img.numpy()
    cartoonized_img = np.clip(cartoonized_img, 0, 1)
    
    return cartoonized_img

def upload_and_cartoonize_image_ai():
    # Open file dialog to select an image
    file_path = filedialog.askopenfilename()

    if file_path:
        # Load the image using OpenCV
        img = cv2.imread(file_path)
        if img is None:
            print("Error loading image.")
            return
        
        # Cartoonize the image using AI (CartoonGAN)
        cartoon_img = cartoonize_image_ai(img)
        
        # Display the original and cartoonized images side by side
        plt.figure(figsize=(10, 5))
        plt.subplot(1, 2, 1)
        plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        plt.title("Original Image")
        
        plt.subplot(1, 2, 2)
        plt.imshow(cartoon_img)
        plt.title("AI Cartoonized Image")
        plt.show()
    else:
        print("No file selected.")

# Create the tkinter GUI for image upload
def create_gui_ai():
    root = tk.Tk()
    root.title("AI Cartoonizer")
    
    # Button to upload and cartoonize image using AI
    upload_btn = tk.Button(root, text="Upload Image", command=upload_and_cartoonize_image_ai)
    upload_btn.pack(pady=20)
    
    root.geometry("300x150")
    root.mainloop()

# Run the GUI
create_gui_ai()
