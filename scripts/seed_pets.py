import requests
import os
import random
from datetime import datetime, timedelta
import pymongo
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv('backend/.env.development')

# MongoDB setup
uri = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DB_NAME')
client = pymongo.MongoClient(uri)
db = client[db_name]
collection = db['dogs']

# S3 setup
bucket = os.getenv('AWS_S3_BUCKET')
region = os.getenv('AWS_REGION')
s3_folder = 'dogs'

# Ensure local directory for dog images
os.makedirs('temp_dogs', exist_ok=True)

# Selected 15 breeds
selected_breeds = [
    "akita", "beagle", "boxer", "chow", "doberman", 
    "labrador", "husky", "poodle", "pug", "retriever", 
    "rottweiler", "samoyed", "shiba", "stbernard", "vizsla"
]

def download_breed_images(breeds, images_per_breed=3):
    print(f"Downloading {images_per_breed} images for {len(breeds)} breeds...")
    breed_image_map = {}
    
    for breed in breeds:
        print(f"Fetching images for {breed}...")
        breed_image_map[breed] = []
        try:
            # Get multiple random images for the breed
            response = requests.get(f'https://dog.ceo/api/breed/{breed}/images/random/{images_per_breed}')
            if response.status_code == 200:
                img_urls = response.json()['message']
                for i, img_url in enumerate(img_urls):
                    img_data = requests.get(img_url).content
                    filename = f"{breed}_{i+1}.jpg"
                    filepath = os.path.join('temp_dogs', filename)
                    with open(filepath, 'wb') as f:
                        f.write(img_data)
                    breed_image_map[breed].append(filename)
            else:
                print(f"Failed to get images for {breed}: {response.status_code}")
        except Exception as e:
            print(f"Error downloading images for {breed}: {e}")
        
        # Respect API limits if any
        time.sleep(0.5)
        
    return breed_image_map

def generate_dogs(breed_image_map, count=1000):
    print(f"Generating {count} dog records with breed-consistent images...")
    dog_names = ["Buddy", "Max", "Bella", "Lucy", "Charlie", "Daisy", "Rocky", "Lola", "Cooper", "Bailey", 
                 "Milo", "Luna", "Bentley", "Sadie", "Tucker", "Ruby", "Bear", "Sophie", "Duke", "Zoe"]
    
    breeds = list(breed_image_map.keys())
    
    dogs_data = []
    for i in range(count):
        breed = random.choice(breeds)
        name = random.choice(dog_names)
        
        # Random birth date in the last 15 years
        days_ago = random.randint(30, 15*365)
        birth_date = datetime.now() - timedelta(days=days_ago)
        
        # Pick a random image from the 3 downloaded for this specific breed
        if breed_image_map[breed]:
            img_filename = random.choice(breed_image_map[breed])
            img_url = f"https://{bucket}.s3.{region}.amazonaws.com/{s3_folder}/{img_filename}"
        else:
            # Fallback if no images found for breed
            img_url = ""

        dogs_data.append({
            'name': name,
            'birthDate': birth_date,
            'breed': breed.capitalize(),
            'image': img_url
        })
    
    # Clear existing data and insert new data
    collection.delete_many({})
    result = collection.insert_many(dogs_data)
    print(f"Successfully seeded {len(result.inserted_ids)} dogs into the database '{db_name}'.")

if __name__ == "__main__":
    # 1. Download images per breed
    breed_image_map = download_breed_images(selected_breeds, 3)
    
    # 2. Instructions for S3
    print("\nNext steps:")
    print(f"1. Run this command to upload images to S3:")
    print(f"aws s3 sync temp_dogs/ s3://{bucket}/{s3_folder}/ --region {region} --profile Solutions_architect")
    
    # 3. Seed MongoDB
    generate_dogs(breed_image_map, 1000)
    
    client.close()
