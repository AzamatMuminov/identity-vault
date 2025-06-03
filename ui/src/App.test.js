// ui/src/App.test.js

import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock ipfs client
jest.mock("./ipfs", () => ({
  ipfs: { add: jest.fn().mockResolvedValue({ cid: { toString: () => "QmMockCid" } }) }
}));

// Mock ethers module so that import { ethers } yields a usable object
jest.mock("ethers", () => {
  return {
    providers: {
      Web3Provider: jest.fn().mockImplementation(() => ({
        send: () => Promise.resolve(["0x1234567890123456789012345678901234567890"]),
        getSigner: () => ({})
      })),
    },
  };
});

// Mock window.ethereum
beforeAll(() => {
  global.window.ethereum = { request: jest.fn().mockResolvedValue(["0x1234567890123456789012345678901234567890"]) };
});

import App from "./App";

test("renders DigiVault title and subtitle", async () => {
  await act(async () => {
    render(<App />);
  });
  expect(screen.getByText("DigiVault")).toBeInTheDocument();
  expect(screen.getByText("Decentralized Identity Vault")).toBeInTheDocument();
});
