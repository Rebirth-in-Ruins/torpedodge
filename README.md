# Torpedodge

TODO: README

Genre: Bullet Hell  

Karte: 5x5 Grid  

Gameplay: In regelmäßigen Abständen fliegen Torpedos vom Himmel und man muss sie ausweichen  
- Semi-Turn based

Architektur & Implementierung: https://excalidraw.com/#room=bb7eb6232149fd7e3974,gP3eHUFJTTvS38REEi4yOg

TODO
- Pfeiltasten und WASD benutzen können
- Musik und Soundeffekte
- Feedback/Animation falls Spieler an eine Wand kollidiert

- Pfeil für die Bewegung soll sich ein bisschen bewegen 

Workshop
1. Leute verbinden sich mit dem Game-Server (Websockets)
2. Im bestimmten Takt kriegen sie den Game-State
    [
        [0,0,0,0,0],
        [0,0,2,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0]
    ]
3. Ziel: Leute programmieren einen Bot der das Schiff passend positioniert

Regeln
- Turn-based
- Online Multiplayer
- Kollision vorhanden
- Bestenliste (im Sinne von io.Games)

Kochen
- Balken an der Seite als Countdown für die Runde
- Je mehr Spieler dazukommen desto größer wird das Feld
    - Spieler und Grid skalieren und werden größer/kleiner
    - Wenn das Grid kleiner wird gibt es Bomben am Rand
- Angriffstypen
        Kreuzexplosion
        [0,0,1,0,0],
        [1,1,2,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0]
        
        Kreisexplosion
        [0,1,1,1,0],
        [0,1,2,1,0],
        [0,1,1,1,0],
        [0,0,0,0,0]

        Queen Black Dragon Move
        [1,0,1,1,1],
        [0,0,0,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0]
- Flugzeug
- Hai
    schwimmt quer über die Karte

- Minen
    Torpedos die auf Minen fliegen machen extra Bumm

- Verschiedene Schifftypen in unterschiedlicher Größe
- Spieler-Färbung über den Erstplatzierten
- Wenn jemand stirbt: Schlechter Spruch mit Death Message
    - "X ist über die Planke gesprungen"
- Items
