import os
import random
from datetime import datetime, timedelta
import pymongo
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env.development')

# MongoDB setup
uri = os.getenv('MONGODB_URI')
db_name = os.getenv('MONGODB_DB_NAME')
client = pymongo.MongoClient(uri)
db = client[db_name]
collection = db['dogs']

def update_dog_birthdates():
    cutoff_date = datetime(2016, 1, 1)
    print(f"Updating dogs with birthDate before {cutoff_date.date()}...")
    
    # Find all dogs with birthDate before 2016
    dogs_to_update = collection.find({"birthDate": {"$lt": cutoff_date}})
    
    count = 0
    now = datetime.now()
    days_between = (now - cutoff_date).days
    
    for dog in dogs_to_update:
        # Generate random date after Jan 1st 2016
        random_days = random.randint(0, days_between)
        new_birthdate = cutoff_date + timedelta(days=random_days)
        
        collection.update_one(
            {"_id": dog["_id"]},
            {"$set": {"birthDate": new_birthdate}}
        )
        count += 1
        if count % 100 == 0:
            print(f"Updated {count} dogs...")

    print(f"Finished! Updated {count} dogs in total.")

if __name__ == "__main__":
    update_dog_birthdates()
    client.close()
