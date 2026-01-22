# src/input_handler.py
import os

def load_texts(data_path="data/raw"):
    texts = []

    for filename in sorted(os.listdir(data_path)):
        if filename.endswith(".txt"):
            file_path = os.path.join(data_path, filename)
            with open(file_path, "r", encoding="utf-8") as file:
                texts.append(file.read())

    return texts
