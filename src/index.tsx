import * as React from "react";
import { render } from "react-dom";
import { Example } from "./Example";

/**
 * WARNING
 *
 * This example is for Framer Motion 1
 *
 * An updated example can be found here: https://codesandbox.io/s/framer-motion-2-drag-to-reorder-fc4rt
 */

import "./styles.css";

const App = () => <Example />;

render(<App />, document.getElementById("root"));
