import csv
import os
from collections import Counter

# Changer le répertoire de travail
os.chdir('data')

# Ouvrir le fichier RawData.txt et lire son contenu
with open('./RawData.txt', 'r', encoding='utf-8') as file:
    raw_data = file.readlines()

    # Liste pour stocker les sommets et les arêtes
    sommet_data = []
    arete_data = []
    nom_counter = Counter()  # Dictionnaire pour compter les apparitions des noms de sommets

    # Traitement des lignes du fichier
    for line in raw_data:
        line = line.strip()
        if line.startswith("V"):
            # Si la ligne commence par "V", traiter comme un sommet
            parts = line.split(";")
            sommet_data.append([parts[1], parts[2], parts[3], parts[4]])  # Ajouter l'ID, le nom, etc.

            # Compter l'apparition du nom du sommet
            nom_counter[parts[2]] += 1  # parts[2] correspond au "Nom"

            # Ajout des couleurs
            color_dict = {
                "1": "fecd08",
                "2": "006db8",
                "3": "999738",
                "3bis": "86d3de",
                "4": "ba499b",
                "5": "f68f4a",
                "6": "75c695",
                "7": "f27aa0",
                "7bis": "75c695",
                "8": "c4a2cb",
                "9": "cdc92a",
                "10": "f68f4a",
                "11": "8d6538",
                "12": "008b59",
                "13": "84d2dd",
                "14": "652d91"
            }
            if parts[3] in color_dict:
                sommet_data[-1].append(color_dict[parts[3]])
        elif line.startswith("E"):
            # Si la ligne commence par "E", traiter comme une arête
            parts = line.split(" ")
            sommet1 = parts[1].zfill(4)  # Mettre sommet1 à 4 chiffres
            sommet2 = parts[2].zfill(4)  # Mettre sommet2 à 4 chiffres

            # Ignorer les arêtes avec temps = 0
            if parts[3] in ["0", "0.0", 0, 0.0]:
                print(f"Arête ignorée: {sommet1} -> {sommet2} (temps = 0)")
                continue

            # Ajouter l'arête avec l'ID formaté et le temps
            arete_data.append([sommet1, sommet2, parts[3]])

# Ajouter le comptage à chaque entrée de sommet
for sommet in sommet_data:
    nom = sommet[1]  # Nom du sommet
    sommet.append(nom_counter[nom])  # Ajouter le nombre de lignes au champ NumberOfLine

# Écriture des sommets dans le fichier Sommet.csv avec séparateur ";"
with open('Sommet.csv', mode='w', newline='', encoding='utf-8') as sommet_file:
    sommet_writer = csv.writer(sommet_file, delimiter=';')
    sommet_writer.writerow(["ID", "Nom", "Line", "IsTerminus", "Color", "NumberOfLine"])  # Écrire l'entête
    sommet_writer.writerows(sommet_data)

# Écriture des arêtes dans le fichier Aretes.csv avec séparateur ";"
"""
Ouvrir le fichier Sommet.csv en mode ecriture
Compter le nombre de fois où apparait un sommet basé sur "Nom"
Mettre NumberOfLine à 1 si le sommet n'apparait qu'une fois, 2 si le sommet apparait 2 fois, etc.
"""
with open('Aretes.csv', mode='w', newline='', encoding='utf-8') as arete_file:
    arete_writer = csv.writer(arete_file, delimiter=';')
    arete_writer.writerow(["Sommet1", "Sommet2", "Time"])  # Écrire l'entête
    arete_writer.writerows(arete_data)  # Écrire les données





# Ouvrir le fichier Sommet.csv en mode lecture
"""
Si il existe un chemin dans Aretes.csv de A vers B, il doit exister un chemin de B vers A qui doit être crée si il n'existe pas.
SAUF pour les trajets suivant : 

Sur la ligne 7bis ( boucle)
    - 0034 -> 0248 -> 0280 -> 0092 -> 0034

Sur la ligne 10 ( embranchement ):
    - 0036 -> 0198 -> 0052 -> 0201 -> 0145
    - 0145 -> 0373 -> 0196 -> 0259 -> 0036
"""
sommet_dict = {}
with open('Sommet.csv', mode='r', encoding='utf-8') as sommet_file:
    sommet_reader = csv.reader(sommet_file, delimiter=';')
    header = next(sommet_reader)  # Ignorer l'en-tête
    
    # Créer un dictionnaire avec les sommets et leurs noms
    for row in sommet_reader:
        sommet_dict[row[0]] = row[1]  # Clé = Nom, Valeur = ID

# Ouvrir le fichier Aretes.csv en mode écriture
with open('Aretes.csv', mode='w', newline='', encoding='utf-8') as arete_file:
    trajets_non_reciproques = [
        ["0034", "0248", "0280", "0092", "0034"],  # Trajet 7bis
        ["0036", "0198", "0052", "0201", "0145"],  # Trajet 10, première partie
        ["0145", "0373", "0196", "0259", "0036"],   # Trajet 10, deuxième partie
    ]

    arete_writer = csv.writer(arete_file, delimiter=';')
    arete_writer.writerow(["Sommet1", "Sommet2", "Time"])  # En-tête du fichier Aretes.csv

    # Écrire les arêtes, en ajustant le temps pour les sommets ayant le même nom
    for arete in arete_data:
        sommet1 = arete[0]
        sommet2 = arete[1]
        time = arete[2]

        # Récupérer les noms des sommets
        sommet1_name = sommet_dict[sommet1]
        sommet2_name = sommet_dict[sommet2]

        # Vérifier si les sommets ont le même nom
        if sommet1_name == sommet2_name:
            # print(f"Sommet identique: {sommet1_name} -> {sommet2_name} (temps = {time})")
            time = 0  # Mettre le temps à 0

        # Écrire l'arête dans le fichier Aretes.csv
        arete_writer.writerow([sommet1, sommet2, time])

        # Vérifier si l'arête est réciproque, sinon la créer sauf pour les trajets spécifiques et si le temps est nul
        if time != "0":  # Ne pas créer d'arêtes réciproques si le temps est nul
            if not any(sommet1 in trajet and sommet2 in trajet for trajet in trajets_non_reciproques):
                # Vérifier si l'arête réciproque existe déjà
                reciproque_exists = any(arete[0] == sommet2 and arete[1] == sommet1 for arete in arete_data)
                if not reciproque_exists:
                    # Ajouter l'arête réciproque (sommet2 -> sommet1)
                    arete_writer.writerow([sommet2, sommet1, time])
                    # print(f"Ajout de l'arête réciproque: {sommet2} -> {sommet1} (temps = {time})")



