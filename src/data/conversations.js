/**
 * Guided Conversation Flows for NammaSahaaya (Phase 3).
 *
 * Each conversation flow defines a structured, step-by-step interaction
 * mapped to local phrase database IDs.
 *
 * IMPORTANT TRANSPARENCY NOTICE:
 * - The application does NOT use speech recognition to guess what a speaker said.
 * - Users choose the option that matches what they heard or what situation occurred.
 * - All suggested responses are everyday polite phrases.
 */

const conversations = [
  {
    "id": "bus-destination",
    "category": "transportation",
    "title": "Boarding a Bus & Reaching Your Destination",
    "titleKannada": "ಬಸ್ ಹತ್ತುವುದು ಮತ್ತು ಗಮ್ಯಸ್ಥಾನ ತಲುಪುವುದು",
    "description": "Ask the conductor or passengers if the bus goes to your stop, buy a ticket, and ask to be alerted.",
    "steps": [
      {
        "id": "step-1",
        "prompt": "You are at the bus stand or bus door. Ask if this bus goes to your destination.",
        "phraseId": "trans-001",
        "responses": [
          {
            "id": "resp-1a",
            "heardText": "The conductor says \"ಹೌದು, ಹೋಗುತ್ತೆ\" (Yes, it goes) or nods to board.",
            "nextStepId": "step-2"
          },
          {
            "id": "resp-1b",
            "heardText": "The conductor says \"ಇಲ್ಲ, ಬೇರೆ ಬಸ್\" (No, take another bus).",
            "nextStepId": "step-alt-boarding"
          }
        ]
      },
      {
        "id": "step-alt-boarding",
        "prompt": "The bus does not go there. Ask where you should board the correct bus.",
        "phraseId": "trans-002",
        "responses": [
          {
            "id": "resp-alt-1",
            "heardText": "They pointed out the platform or platform number. You find the correct bus.",
            "nextStepId": "step-1"
          }
        ]
      },
      {
        "id": "step-2",
        "prompt": "You board the bus. Ask the conductor how much the ticket is.",
        "phraseId": "trans-006",
        "responses": [
          {
            "id": "resp-2a",
            "heardText": "Conductor tells you the amount (e.g. \"ಇಪ್ಪತ್ತು ರೂಪಾಯಿ\" - 20 rupees). You need change.",
            "nextStepId": "step-change"
          },
          {
            "id": "resp-2b",
            "heardText": "You pay exact fare and take your ticket.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-change",
        "prompt": "You have a large currency note. Ask if change is available.",
        "phraseId": "trans-007",
        "responses": [
          {
            "id": "resp-change-done",
            "heardText": "The conductor gives you the ticket and change.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "prompt": "You want to make sure you do not miss your stop. Ask to be alerted when it arrives.",
        "phraseId": "trans-004",
        "responses": [
          {
            "id": "resp-3a",
            "heardText": "Conductor or passenger agrees to alert you.",
            "nextStepId": "step-4"
          },
          {
            "id": "resp-3b",
            "heardText": "The bus is travelling. You want to check what the next stop is.",
            "nextStepId": "step-check-next"
          }
        ]
      },
      {
        "id": "step-check-next",
        "prompt": "Ask someone nearby which stop is coming up next.",
        "phraseId": "trans-003",
        "responses": [
          {
            "id": "resp-check-next-done",
            "heardText": "They tell you the stop name and your destination is next.",
            "nextStepId": "step-4"
          }
        ]
      },
      {
        "id": "step-4",
        "prompt": "Your destination has arrived. Ask to be dropped off at the stop.",
        "phraseId": "trans-005",
        "isFinal": true,
        "completionMessage": "You have successfully reached your destination by bus!"
      }
    ]
  },
  {
    "id": "shopping-market",
    "category": "shopping",
    "title": "Buying Groceries or Market Items",
    "titleKannada": "ತರಕಾರಿ ಅಥವಾ ಅಂಗಡಿಯಲ್ಲಿ ಖರೀದಿ",
    "description": "Inquire about prices, adjust quantities, ask for discounts, and pay with UPI or cash.",
    "steps": [
      {
        "id": "step-1",
        "prompt": "You see an item or vegetable you want. Ask the shopkeeper how much it costs.",
        "phraseId": "shop-001",
        "responses": [
          {
            "id": "resp-1a",
            "heardText": "Shopkeeper states the price per kg (e.g. \"ನಲವತ್ತು ರೂಪಾಯಿ\" - 40 rs). You want a smaller amount.",
            "nextStepId": "step-2"
          },
          {
            "id": "resp-1b",
            "heardText": "The price seems high. You want to ask for a small discount.",
            "nextStepId": "step-discount"
          }
        ]
      },
      {
        "id": "step-discount",
        "prompt": "Politely ask if they can reduce the price a little.",
        "phraseId": "shop-011",
        "responses": [
          {
            "id": "resp-disc-ok",
            "heardText": "The shopkeeper agrees or gives a reasonable final price.",
            "nextStepId": "step-2"
          }
        ]
      },
      {
        "id": "step-2",
        "prompt": "You only want 500 grams. Tell them half a kilogram is enough.",
        "phraseId": "shop-004",
        "responses": [
          {
            "id": "resp-2a",
            "heardText": "Shopkeeper weighs the item and packs it.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "prompt": "Ask if you can pay using UPI or Google Pay via QR code.",
        "phraseId": "shop-008",
        "responses": [
          {
            "id": "resp-3a",
            "heardText": "They point to the UPI QR code scanner.",
            "nextStepId": "step-4"
          },
          {
            "id": "resp-3b",
            "heardText": "They do not have UPI, you need to ask if card is supported.",
            "nextStepId": "step-card"
          }
        ]
      },
      {
        "id": "step-card",
        "prompt": "Ask if they accept card payment.",
        "phraseId": "shop-009",
        "responses": [
          {
            "id": "resp-card-done",
            "heardText": "Payment is completed.",
            "nextStepId": "step-4"
          }
        ]
      },
      {
        "id": "step-4",
        "prompt": "Ask for a carry bag for your purchases.",
        "phraseId": "shop-012",
        "isFinal": true,
        "completionMessage": "Shopping complete! You got your items and paid smoothly."
      }
    ]
  },
  {
    "id": "clinic-reception",
    "category": "healthcare",
    "title": "Hospital or Clinic Reception & Registration",
    "titleKannada": "ಆಸ್ಪತ್ರೆಯ ನೋಂದಣಿ ಮತ್ತು ಸಹಾಯ",
    "description": "Find the reception desk, register as a new patient, inquire about doctor appointments, and navigate waiting.",
    "steps": [
      {
        "id": "step-1",
        "prompt": "You arrive at the clinic or hospital building. Ask security or staff where the reception counter is.",
        "phraseId": "health-005",
        "responses": [
          {
            "id": "resp-1a",
            "heardText": "They direct you to the front reception desk.",
            "nextStepId": "step-2"
          }
        ]
      },
      {
        "id": "step-2",
        "prompt": "You are a first-time visitor. Ask where to do new patient registration.",
        "phraseId": "health-001",
        "responses": [
          {
            "id": "resp-2a",
            "heardText": "Reception gives you a patient form to fill out.",
            "nextStepId": "step-form-help"
          },
          {
            "id": "resp-2b",
            "heardText": "Reception asks you to book a slot for today.",
            "nextStepId": "step-today-slot"
          }
        ]
      },
      {
        "id": "step-form-help",
        "prompt": "The registration form is difficult to understand. Ask for assistance filling it out.",
        "phraseId": "health-011",
        "responses": [
          {
            "id": "resp-form-done",
            "heardText": "The receptionist helps you fill in your details and issues a token.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-today-slot",
        "prompt": "Ask reception if a doctor's appointment slot is available today.",
        "phraseId": "health-004",
        "responses": [
          {
            "id": "resp-slot-ok",
            "heardText": "They confirm an appointment and give you a token number.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "prompt": "Ask the receptionist where you should wait for your turn.",
        "phraseId": "health-007",
        "responses": [
          {
            "id": "resp-3a",
            "heardText": "They point to the waiting chairs in front of the doctor's room.",
            "nextStepId": "step-4"
          }
        ]
      },
      {
        "id": "step-4",
        "prompt": "You have been waiting. Ask when your token number will be called or how long it will take.",
        "phraseId": "health-008",
        "isFinal": true,
        "completionMessage": "Registration complete! You are in the queue for your consultation."
      }
    ]
  },
  {
    "id": "asking-directions",
    "category": "directions",
    "title": "Finding a Location on the Street",
    "titleKannada": "ರಸ್ತೆಯಲ್ಲಿ ದಾರಿ ಕೇಳುವುದು",
    "description": "Show an address or map, ask if it is nearby, understand turns, and ask people to speak slowly.",
    "steps": [
      {
        "id": "step-1",
        "prompt": "You are on the street looking for a landmark or address. Ask a passerby where this place is.",
        "phraseId": "dir-001",
        "responses": [
          {
            "id": "resp-1a",
            "heardText": "They speak quickly or use complex words. You need them to speak slowly.",
            "nextStepId": "step-slow"
          },
          {
            "id": "resp-1b",
            "heardText": "They point in a direction. You want to know if it is near or far.",
            "nextStepId": "step-distance"
          }
        ]
      },
      {
        "id": "step-slow",
        "prompt": "Politely ask them to speak a little slowly so you can understand.",
        "phraseId": "dir-010",
        "responses": [
          {
            "id": "resp-slow-ok",
            "heardText": "They explain more simply. You want to confirm if you can walk there.",
            "nextStepId": "step-walk"
          }
        ]
      },
      {
        "id": "step-distance",
        "prompt": "Ask whether the place is near or far from where you are standing.",
        "phraseId": "dir-005",
        "responses": [
          {
            "id": "resp-dist-near",
            "heardText": "They say \"ಹತ್ತಿರ ಇದೆ\" (It is nearby).",
            "nextStepId": "step-walk"
          }
        ]
      },
      {
        "id": "step-walk",
        "prompt": "Ask if it is walkable on foot.",
        "phraseId": "dir-004",
        "responses": [
          {
            "id": "resp-walk-yes",
            "heardText": "They say yes and explain the turn.",
            "nextStepId": "step-turn"
          }
        ]
      },
      {
        "id": "step-turn",
        "prompt": "Confirm whether you should turn left or right at the junction.",
        "phraseId": "dir-008",
        "responses": [
          {
            "id": "resp-turn-confirm",
            "heardText": "They confirm: \"ಹೌದು, ಎಡಕ್ಕೆ\" (Yes, left) or \"ಇಲ್ಲ, ಬಲಕ್ಕೆ\" (No, right).",
            "nextStepId": "step-straight"
          }
        ]
      },
      {
        "id": "step-straight",
        "prompt": "Confirm the final instruction to go straight ahead.",
        "phraseId": "dir-012",
        "isFinal": true,
        "completionMessage": "You now have clear directions to reach your destination!"
      }
    ]
  }
];

export default conversations;

/**
 * Returns all available conversation flows.
 */
export function getAllConversations() {
  return conversations;
}

/**
 * Finds a conversation flow by its category.
 */
export function getConversationsByCategory(category) {
  if (!category) return conversations;
  const normalized = category.toLowerCase().trim();
  return conversations.filter((c) => c.category.toLowerCase() === normalized);
}

/**
 * Finds a conversation flow by ID.
 */
export function getConversationById(id) {
  return conversations.find((c) => c.id === id) || null;
}
