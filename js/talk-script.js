"use strict";
/* What each vendor says on Your street.
   A line can start with [happy] or [sad] to change the portrait; otherwise the vendor looks neutral.
   {you} is how the vendor addresses the player: "pretty", "handsome" or "friend", picked on the intro screen,
   the way street sellers in Vietnam call out "Hey pretty!" or "Hey handsome!" to passers-by.
   greet  – said when you walk up and press E
   learn  – "Tell me about …"
   shop   – intro line, things to buy (price in đồng), and what they say after you buy
   chats  – the player's line (ask) and the vendor's reply
   bye    – happy: you bought something · sad: you left while they were talking · calm: any other goodbye
   The calls themselves stay in Vietnamese in quotes, with the meaning given in English, because they are the sound of the street. */
const TALK = {
  banhmi: {
    name:"Auntie Lan", role:"Bánh mì seller",
    greet:[
      "[happy] Hey {you}! Out for a late snack?",
      "The rolls are still warm. I keep them under this cloth all the way from the bakery."
    ],
    learn:[
      "Bánh mì came here with the French, but we made it our own.",
      "A crisp shell, soft inside. Then pâté, butter, pickled carrot and radish, and a little chilli.",
      "Every evening I ride from alley to alley calling \"Bánh mì nóng giòn đây!\" It means: hot, crispy bread here!",
      "[happy] I stretch out the last word so it reaches the end of the alley."
    ],
    shop:{
      intro:"What would you like, {you}? Everything's fresh tonight.",
      items:[
        {id:"banhmi-khong", name:"Plain roll", en:"Just the warm bread", price:5000},
        {id:"banhmi-pate", name:"Pâté bánh mì", en:"Pâté, butter and pickles", price:20000},
        {id:"banhmi-xiu-mai", name:"Meatball bánh mì", en:"Pork meatballs in tomato sauce", price:25000}
      ],
      thanks:["[happy] Here you go, still warm. Careful, the crust crackles!"]
    },
    chats:[
      {ask:"How long have you sold bánh mì?", reply:[
        "Almost twenty years. Same bicycle, new tyres.",
        "[happy] The children of my first customers buy from me now."
      ]},
      {ask:"Is it hard, riding every night?", reply:[
        "My legs know every pothole on this street.",
        "[sad] Fewer people wait for me now. They order on their phones.",
        "But someone always opens a window when they hear me."
      ]}
    ],
    bye:{
      happy:"[happy] Thank you, {you}! Come back tomorrow, I'll save you a warm one.",
      sad:"[sad] Oh… leaving already? Okay… get home safe.",
      calm:"Alright, get home safe, {you}."
    }
  },

  hotvitlon: {
    name:"Grandma Sáu", role:"Hột vịt lộn seller",
    greet:[
      "Hey {you}! Come, sit, sit. The eggs are hot.",
      "I wrap them in cloth so they stay warm until midnight."
    ],
    learn:[
      "Hột vịt lộn is a duck egg, boiled just before it would hatch.",
      "Crack the top, sip the broth first, then eat it with Vietnamese mint, salt, pepper and lime.",
      "Up North they have a different name for it. Here in the South, it's hột vịt lộn.",
      "[happy] Some people are scared the first time. Then they come back every week."
    ],
    shop:{
      intro:"How many, {you}?",
      items:[
        {id:"hotvitlon-mot", name:"One egg", en:"With Vietnamese mint and salt", price:8000},
        {id:"hotvitlon-ba", name:"Three eggs", en:"For sharing", price:22000},
        {id:"hotvitlon-xao-me", name:"Tamarind eggs", en:"Stir-fried in tamarind sauce", price:30000}
      ],
      thanks:["[happy] Eat it while it's hot! Sip the broth first, okay?"]
    },
    chats:[
      {ask:"Isn't that pole heavy?", reply:[
        "Forty years on this shoulder. It's lighter than it looks.",
        "[happy] Or maybe my shoulder is just stronger than it looks!"
      ]},
      {ask:"Why do you sell so late?", reply:[
        "People get hungry after the night shift, after karaoke, after a long talk.",
        "\"Hột vịt lộn đây!\" That's my lullaby for the street."
      ]}
    ],
    bye:{
      happy:"[happy] Enjoy, {you}! Come back and see Grandma Sáu again.",
      sad:"[sad] Oh… you're going? Okay, okay. Goodbye.",
      calm:"Off you go, {you}. Walk safely."
    }
  },

  che: {
    name:"Hoa", role:"Chè seller",
    greet:[
      "[happy] Hey {you}! Hot night, isn't it? Perfect for chè.",
      "Look through the glass. If you can't decide, pick by colour."
    ],
    learn:[
      "Chè is a whole family of sweet soups and puddings.",
      "Black bean, mung bean, taro, jelly, sticky rice… finished with coconut milk and crushed ice.",
      "My mother is from Huế. They say Huế has more kinds of chè than there are days in a month.",
      "[happy] That's why my cart has glass sides. You choose with your eyes first."
    ],
    shop:{
      intro:"Which one catches your eye, {you}?",
      items:[
        {id:"che-dau-den", name:"Black bean chè", en:"With coconut milk", price:15000},
        {id:"che-ba-mau", name:"Three-colour chè", en:"Beans, jelly and coconut in layers", price:20000},
        {id:"che-thai", name:"Thai-style chè", en:"Fruit, jelly and coconut milk", price:25000}
      ],
      thanks:["[happy] Extra ice for you. Stir it all the way to the bottom!"]
    },
    chats:[
      {ask:"Why is your call a question?", reply:[
        "Because it's an invitation, not an order!",
        "\"Ai ăn chè không?\" means \"Who wants chè?\" The last word turns it into a question.",
        "[happy] And somebody always says 'me!'"
      ]},
      {ask:"Which one is your favourite?", reply:[
        "Sweet corn chè. My grandmother made it every summer.",
        "[sad] I can never find corn as sweet as hers.",
        "[happy] But I keep trying. Maybe tomorrow!"
      ]}
    ],
    bye:{
      happy:"[happy] Thank you, {you}! Come back tomorrow, I'm making sweet corn chè.",
      sad:"[sad] Oh… already? Okay. Bye bye.",
      calm:"Okay! Don't let the heat get you, {you}. Bye!"
    }
  },

  hutieugo: {
    name:"Tâm", role:"Hủ tiếu gõ runner",
    greet:[
      "Tock-tock! Tock-tock! Hey {you}, you heard me!",
      "I'm the runner. I knock, take your order, and bring your bowl back from the cart."
    ],
    learn:[
      "Hủ tiếu gõ is named after a sound, not a voice. \"Gõ\" means to knock.",
      "We knock two bamboo sticks together, so the whole alley knows the noodles are here.",
      "People call down from their balconies, and I run up the stairs with the bowl.",
      "[happy] Saigon nights are loud, but everybody knows this sound."
    ],
    shop:{
      intro:"What'll it be, {you}? The broth has been going since this afternoon.",
      items:[
        {id:"hutieu-thuong", name:"Pork noodle soup", en:"Rice noodles, pork and broth", price:25000},
        {id:"mi-hoanh-thanh", name:"Wonton noodles", en:"Egg noodles with wontons", price:30000},
        {id:"hutieu-dac-biet", name:"The special", en:"Extra pork, liver and quail eggs", price:35000}
      ],
      thanks:["[happy] Coming right up! Tock-tock, one bowl!"]
    },
    chats:[
      {ask:"Can I try the clappers?", reply:[
        "Sure, but it's harder than it looks.",
        "Two short, two short, then a little roll. Tock-tock… tock-tock… tock-tock-tock!",
        "[happy] Not bad! You'd make a decent runner."
      ]},
      {ask:"Do you run all night?", reply:[
        "Until two, sometimes three in the morning.",
        "[sad] More people use delivery apps now. Fewer calls from the balconies.",
        "But the regulars still wait for the knock."
      ]}
    ],
    bye:{
      happy:"[happy] Thanks, {you}! Listen for the knock tomorrow!",
      sad:"[sad] Oh… gotta go? Okay… tock-tock, bye.",
      calm:"Alright, see you around the alley, {you}!"
    }
  },

  banhgio: {
    name:"Auntie Thu", role:"Bánh giò seller",
    greet:[
      "Hey {you}. Cold tonight, isn't it?",
      "Come closer to the basket. It's warm here."
    ],
    learn:[
      "Bánh giò is a rice dumpling shaped like a little pyramid.",
      "Inside there's minced pork and wood-ear mushroom, all wrapped in banana leaf and steamed.",
      "On winter nights I walk the Old Quarter with this basket, calling \"Ai bánh giò nóng đây!\" Who wants hot dumplings?",
      "[happy] Many people in Hà Nội say that call is the sound of winter."
    ],
    shop:{
      intro:"One for now, {you}, or some to take home?",
      items:[
        {id:"banhgio-thuong", name:"One dumpling", en:"Pork and mushroom in banana leaf", price:15000},
        {id:"banhgio-trung-cut", name:"Quail egg dumpling", en:"With quail eggs inside", price:20000},
        {id:"banhgio-cha", name:"Dumpling with pork roll", en:"With a slice of pork roll on the side", price:25000}
      ],
      thanks:["[happy] Unwrap it slowly, the steam is very hot. Enjoy!"]
    },
    chats:[
      {ask:"Why only in winter?", reply:[
        "In summer, nobody wants something this hot!",
        "[happy] In winter, people hear my call and run downstairs in their slippers."
      ]},
      {ask:"Do you make them yourself?", reply:[
        "Every afternoon. Folding the leaves takes the longest.",
        "[happy] My daughter helps on weekends. She folds faster than me now."
      ]}
    ],
    bye:{
      happy:"[happy] Thank you, {you}! Keep warm, and come again.",
      sad:"[sad] Oh… going so soon? Goodbye then.",
      calm:"Walk safely, {you}. Wrap up warm."
    }
  },

  banhbao: {
    name:"Uncle Hùng", role:"Bánh bao seller",
    greet:[
      "Hot steamed buns here! Oh, sorry, that's the recording.",
      "[happy] The real me is right here. Hungry, {you}?"
    ],
    learn:[
      "Bánh bao are steamed buns, soft and white, filled with pork, egg and Chinese sausage.",
      "My father sold them too. He called out every night until his voice gave up.",
      "[sad] Now I play a recording from this loudspeaker. Same words, every time.",
      "Listen closely: the recording never changes. A real voice is a little different every night."
    ],
    shop:{
      intro:"What'll you have, {you}?",
      items:[
        {id:"banhbao-chay", name:"Plain bun", en:"No filling", price:6000},
        {id:"banhbao-thit", name:"Pork and egg bun", en:"The classic", price:15000},
        {id:"banhbao-xa-xiu", name:"BBQ pork bun", en:"Sweet barbecue pork", price:18000}
      ],
      thanks:["[happy] Straight from the steamer. Mind your fingers!"]
    },
    chats:[
      {ask:"Why use a recording?", reply:[
        "I ride for five hours. My voice wouldn't last one.",
        "[sad] Sometimes I miss calling out myself."
      ]},
      {ask:"Could you do the call for real?", reply:[
        "For you, {you}? Okay, listen.",
        "[happy] \"Bánh bao nóng hổi đây!\" Piping-hot buns here! …Hah, still got it."
      ]}
    ],
    bye:{
      happy:"[happy] Thank you, {you}! Listen for the loudspeaker, I'll be back tomorrow.",
      sad:"[sad] Oh… okay. Goodbye then.",
      calm:"Alright, take care, {you}! Beep beep."
    }
  }
};
