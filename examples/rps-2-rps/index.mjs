// mjs defines the user interface

const HAND = ['Rock', 'Paper', 'Scissors']; // this + next ln defines arrays to hold the meaning of the hands and outcomes 
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins']; 
const Player = (Who) => ({//  defines a constructor for the player implementation
  getHand: () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`${Who} played ${HAND[hand]}`);
    return hand;// implement the gethand method 
  },
  seeOutcome: (outcome) => {
    console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);// implement the seeOutCome function
  },
});

await Promise.all([
  ctcAlice.p.Alice({
    ...Player('Alice'),// instanciate the impementation once for Alice
  }),
  ctcBob.p.Bob({
    ...Player('Bob'),// instanciate the implementation once for Bob
  }),
]);