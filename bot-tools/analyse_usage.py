import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def analyse_usage():
    print("Analyse des tokens fictive...")
    # À implémenter selon votre structure Supabase ou logs
    # Exemple fictif
    data = {
        "user1": 1200,
        "user2": 980,
        "entreprise-X": 3600
    }
    for k, v in data.items():
        print(f"{k}: {v} tokens")

if __name__ == "__main__":
    analyse_usage()
