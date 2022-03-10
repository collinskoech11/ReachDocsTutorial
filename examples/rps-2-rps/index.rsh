'reach 0.1';

const Player = {// defines a participant interract interfce (With two methods which both receive a number)
  getHand: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
};

export const main = Reach.App(() => {// this interface for both participants. Because of this line, interact in the rest of the program will be bound to an object with methods corresponding to these actions, which will connect to the frontend of the corresponding participant.
  const Alice = Participant('Alice', {
    ...Player,
  });
  const Bob   = Participant('Bob', {
    ...Player,
  });
  init();

  Alice.only(() => {// This block can only be performed by alice 
    //   const handAlice = declassify(interact.getHand());//only known to alice 
  })
//   Alice.publish(handAlice);// Alice join the application by publishing the value to the consensus network, 

//   commit();// commits the state of the consensus network and returns to local step
  Bob.only(() => {
    //   const handBob = declassify(interract.getHand());
  });
//   Bob.publish(handBob);

//   const outcome = (handAlice + (4 - handBob)) % 3;//computes the outcome of the game before committing 
// //   commit();

//   each([Alice, Bob], () => {//states that this is a local step that each participant performs 
//       interact.seeOutcome(outcome);
  })
})