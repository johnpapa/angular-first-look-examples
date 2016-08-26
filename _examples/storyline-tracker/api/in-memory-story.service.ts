export class InMemoryStoryService {
  /**
  * Creates fresh copy of data each time.
  * Safe for consuming service to morph arrays and objects.
  */
  createDb() {
    let characters = [
      {
        "id": 11,
        "name": "Chewbacca",
        "side": "light"
      },
      {
        "id": 12,
        "name": "Rey",
        "side": "light"
      },
      {
        "id": 13,
        "name": "Finn (FN2187)",
        "side": "light"
      },
      {
        "id": 14,
        "name": "Han Solo",
        "side": "light"
      },
      {
        "id": 15,
        "name": "Leia Organa",
        "side": "light"
      },
      {
        "id": 16,
        "name": "Luke Skywalker",
        "side": "light"
      },
      {
        "id": 17,
        "name": "Poe Dameron",
        "side": "light"
      },
      {
        "id": 18,
        "name": "Kylo Ren",
        "side": "dark"
      },
      {
        "id": 19,
        "name": "Supreme Commander Snoke",
        "side": "dark"
      },
      {
        "id": 20,
        "name": "R2-D2",
        "side": "light"
      },
      {
        "id": 21,
        "name": "BB8",
        "side": "light"
      },
      {
        "id": 22,
        "name": "C-3PO",
        "side": "light"
      },
      {
        "id": 23,
        "name": "Maz Kanata",
        "side": "light"
      },
      {
        "id": 24,
        "name": "Captain Phasma",
        "side": "dark"
      },
      {
        "id": 25,
        "name": "General Hux",
        "side": "dark"
      },
      {
        "id": 26,
        "name": "Lor San Tekka",
        "side": "light"
      }
    ];

    let vehicles = [
      {
        "id": 30,
        "name": "Millennium Falcon",
        "type": "space"
      },
      {
        "id": 32,
        "name": "X-Wing Fighter",
        "type": "space"
      },
      {
        "id": 33,
        "name": "Imperial Star Destroyer",
        "type": "space"
      },
      {
        "id": 34,
        "name": "AT-AT Walker",
        "type": "land"
      },
      {
        "id": 35,
        "name": "TIE Fighter",
        "type": "space"
      },
      {
        "id": 36,
        "name": "B-Wing Fighter",
        "type": "space"
      },
      {
        "id": 37,
        "name": "ETA-2 Jedi Starfighter",
        "type": "space"
      },
      {
        "id": 38,
        "name": "TIE Interceptor",
        "type": "space"
      },
      {
        "id": 39,
        "name": "X-34 Landspeeder",
        "type": "land"
      },
      {
        "id": 40,
        "name": "Snow Speeder",
        "type": "land"
      },
      {
        "id": 41,
        "name": "X-34 Landspeeder",
        "type": "land"
      }
    ]

    return { characters, vehicles };
  }
}