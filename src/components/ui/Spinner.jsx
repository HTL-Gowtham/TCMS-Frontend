/**
 * @file Spinner.jsx
 * @description Simple centered loading spinner for page-level loading states.
 *
 * Props:
 *   message {string} — optional label below the spinner
 */

import "./Spinner.css";

/* eslint-disable react/prop-types */
const Spinner = ({ message = "Loading..." }) => (
  <div className="spinner-wrapper">
    <div className="spinner" aria-label="Loading" />
    <p className="spinner-text">{message}</p>
  </div>
);

export default Spinner;
