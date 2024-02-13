import React, { FC } from 'react';

interface Props {

  min: number;
  max: number;
}

const RandomNum: FC<Props> = ({ min, max }) => {
  const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const randomNumber = getRandomNumber(min, max);

  return <>{randomNumber}</>;
};

// const getRandomNumber = (min: number, max: number): number => {
//     return Math.floor(Math.random() * (max - min + 1) + min);
//   };
  
//   export default getRandomNumber;

export default RandomNum;
