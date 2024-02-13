## What is this?
A Title tag &&
A List item &&
A random number generator

## Installation

Run `npm i test-button-x`

Use:

```
import { Head2, List, RandomNum } from "test-button-x";

function App() {
  return (
    <>
      <Head2>Title of your page</Head2>
      <List>Second list item</List>
      <RandomNum min={1} max={100} />
    </>
  );
}

export default App;
```

## Parameters

The Random Number Generator accepts two parameters, min and max values.

By default, `min` is set to 0, and `max` is set to 100.