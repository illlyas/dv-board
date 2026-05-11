"use client";

import React, { useId } from "react";
import {
  kpiPresetIconCssVars,
  type KpiPresetIconSvgProps,
} from "../kpi-preset-icon-shared";

/** KPI 预设矢量：KpiIconCapsule（内联 SVG，取色见 --asset-icon-*） */
export function KpiIconCapsule(props: KpiPresetIconSvgProps) {
  const p = useId().replace(/:/g, "");
  const I = (s: string) => `${p}-${s}`;
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      style={{ ...kpiPresetIconCssVars(), ...props.style }}
      aria-hidden
    >
      <g fill="none" className="nc-icon-wrapper">
          <path fillRule="evenodd" clipRule="evenodd" d="M16.9998 1C20.3135 1 22.9998 3.68629 22.9998 7C22.9998 9.83068 21.0392 12.2014 18.4022 12.833C20.6606 15.1822 20.6338 18.9168 18.3192 21.2314C15.9761 23.5744 12.1769 23.5743 9.83381 21.2314L6.29768 17.6953C4.8839 16.2809 5.46664 12.6212 7.58772 10.5C8.58585 9.50187 9.92459 8.84333 11.2098 8.57422C11.0737 8.07244 10.9998 7.54485 10.9998 7C10.9998 3.68634 13.6862 1.00008 16.9998 1Z" fill={`url(#${I("i0")})`} data-glass="origin" mask={`url(#${I("i5")})`}></path>
          <path fillRule="evenodd" clipRule="evenodd" d="M16.9998 1C20.3135 1 22.9998 3.68629 22.9998 7C22.9998 9.83068 21.0392 12.2014 18.4022 12.833C20.6606 15.1822 20.6338 18.9168 18.3192 21.2314C15.9761 23.5744 12.1769 23.5743 9.83381 21.2314L6.29768 17.6953C4.8839 16.2809 5.46664 12.6212 7.58772 10.5C8.58585 9.50187 9.92459 8.84333 11.2098 8.57422C11.0737 8.07244 10.9998 7.54485 10.9998 7C10.9998 3.68634 13.6862 1.00008 16.9998 1Z" fill={`url(#${I("i0")})`} data-glass="clone" filter={`url(#${I("i4")})`} clipPath={`url(#${I("i3")})`}></path>
          <path d="M11.2479 5.6747L14.7835 9.21024L14.7327 9.31584C12.9648 12.9933 9.98707 15.9516 6.2982 17.6955L2.76266 14.16C0.419519 11.8168 0.419518 8.01785 2.76266 5.6747C5.10581 3.33156 8.9048 3.33156 11.2479 5.6747Z" fill={`url(#${I("i1")})`} data-glass="blur"></path>
          <path d="M2.76304 5.67533C5.10619 3.33218 8.90427 3.33218 11.2474 5.67533L14.7836 9.21048L14.7328 9.31595L14.5638 9.65873C12.7784 13.1773 9.87184 16.0064 6.2982 17.6958L2.76304 14.1597C0.493104 11.8898 0.422054 8.25427 2.55015 5.89896L2.76304 5.67533ZM10.7171 6.2056C8.66689 4.15535 5.34357 4.15535 3.29332 6.2056C1.24306 8.25585 1.24306 11.5792 3.29332 13.6294L6.44761 16.7847C9.64132 15.1529 12.24 12.5554 13.8724 9.3599L10.7171 6.2056Z" fill={`url(#${I("i2")})`}></path>
          <defs>
            <linearGradient id={I("i0")} x1="14.262" y1="1" x2="14.262" y2="22.989" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--asset-icon-stop-shade-mid)" data-glass-11="on"></stop>
              <stop offset="1" stopColor="var(--asset-icon-stop-shade-deep)" data-glass-12="on"></stop>
            </linearGradient>
            <linearGradient id={I("i1")} x1="11.646" y1="6.073" x2="3.161" y2="14.558" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--asset-icon-stop-frost-from)" data-glass-21="on"></stop>
              <stop offset="1" stopColor="var(--asset-icon-stop-frost-to)" data-glass-22="on"></stop>
            </linearGradient>
            <linearGradient id={I("i2")} x1="7.895" y1="3.918" x2="7.895" y2="11.897" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--asset-icon-stop-highlight)" data-glass-light="on"></stop>
              <stop offset="1" stopColor="var(--asset-icon-stop-highlight)" stopOpacity="0" data-glass-light="on"></stop>
            </linearGradient>
            <filter id={I("i4")} x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="2" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
            </filter>
            <clipPath id={I("i3")}>
              <path d="M11.2479 5.6747L14.7835 9.21024L14.7327 9.31584C12.9648 12.9933 9.98707 15.9516 6.2982 17.6955L2.76266 14.16C0.419519 11.8168 0.419518 8.01785 2.76266 5.6747C5.10581 3.33156 8.9048 3.33156 11.2479 5.6747Z" fill={`url(#${I("i1")})`}></path>
            </clipPath>
            <mask id={I("i5")}>
              <rect width="100%" height="100%" fill="var(--asset-icon-mask-bg)"></rect>
              <path d="M11.2479 5.6747L14.7835 9.21024L14.7327 9.31584C12.9648 12.9933 9.98707 15.9516 6.2982 17.6955L2.76266 14.16C0.419519 11.8168 0.419518 8.01785 2.76266 5.6747C5.10581 3.33156 8.9048 3.33156 11.2479 5.6747Z" fill="var(--asset-icon-mask-cutout)"></path>
            </mask>
          </defs>
        </g>
    </svg>
  );
}
