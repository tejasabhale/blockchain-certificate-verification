import React from "react";
import { NavLink } from "react-router-dom";
import { shortenAddress } from "../lib/contract";

export default function Header({ account, onConnect, isConnecting }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="font-semibold text-gray-900 text-base">
            Certificate Registry
          </NavLink>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              Issue
            </NavLink>
            <NavLink
              to="/verify"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              Verify
            </NavLink>
          </nav>
        </div>

        <div>
          {account ? (
            <span className="text-xs font-mono px-2.5 py-1.5 rounded border border-gray-300 bg-gray-50 text-gray-700">
              {shortenAddress(account)}
            </span>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
