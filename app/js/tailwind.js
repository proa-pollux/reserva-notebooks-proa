tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "on-secondary-container": "#57657a",
                "on-tertiary-fixed": "#001e2f",
                "tertiary-container": "#0074a6",
                "primary-container": "#2563eb",
                "on-primary-fixed-variant": "#003ea8",
                "on-secondary-fixed-variant": "#3a485b",
                "error-container": "#ffdad6",
                "inverse-on-surface": "#eff1f3",
                "secondary": "#515f74",
                "on-secondary": "#ffffff",
                "surface-container-lowest": "#ffffff",
                "on-primary-container": "#eeefff",
                "primary-fixed": "#dbe1ff",
                "surface-bright": "#f7f9fb",
                "on-background": "#191c1e",
                "background": "#f7f9fb",
                "surface-variant": "#e0e3e5",
                "on-error-container": "#93000a",
                "on-surface-variant": "#434655",
                "error": "#ba1a1a",
                "inverse-surface": "#2d3133",
                "surface-dim": "#d8dadc",
                "on-primary-fixed": "#00174b",
                "secondary-fixed": "#d5e3fc",
                "tertiary-fixed-dim": "#89ceff",
                "outline": "#737686",
                "secondary-container": "#d5e3fc",
                "on-tertiary-container": "#e4f2ff",
                "surface-container-low": "#f2f4f6",
                "surface-container-highest": "#e0e3e5",
                "inverse-primary": "#b4c5ff",
                "on-primary": "#ffffff",
                "tertiary-fixed": "#c9e6ff",
                "on-surface": "#191c1e",
                "outline-variant": "#c3c6d7",
                "tertiary": "#005a82",
                "surface-container": "#eceef0",
                "on-error": "#ffffff",
                "surface-tint": "#0053db",
                "on-secondary-fixed": "#0d1c2e",
                "surface-container-high": "#e6e8ea",
                "on-tertiary": "#ffffff",
                "surface": "#f7f9fb",
                "on-tertiary-fixed-variant": "#004c6e",
                "primary-fixed-dim": "#b4c5ff",
                "primary": "#004ac6",
                "secondary-fixed-dim": "#b9c7df"
            },

            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px"
            },

            spacing: {
                sm: "8px",
                gutter: "12px",
                xl: "32px",
                xs: "4px",
                md: "16px",
                lg: "24px",
                "container-padding": "16px",
                base: "4px"
            },

            fontFamily: {
                "display-lg": ["Hanken Grotesk"],
                "body-lg": ["Hanken Grotesk"],
                "label-lg": ["Hanken Grotesk"],
                "title-lg": ["Hanken Grotesk"],
                "headline-md": ["Hanken Grotesk"],
                "body-md": ["Hanken Grotesk"],
                "headline-md-mobile": ["Hanken Grotesk"]
            },

            fontSize: {
                "display-lg": [
                    "32px",
                    {
                        lineHeight: "40px",
                        letterSpacing: "-0.02em",
                        fontWeight: "700"
                    }
                ],
                "body-lg": [
                    "16px",
                    {
                        lineHeight: "24px",
                        fontWeight: "400"
                    }
                ],
                "label-lg": [
                    "12px",
                    {
                        lineHeight: "16px",
                        letterSpacing: "0.05em",
                        fontWeight: "600"
                    }
                ],
                "title-lg": [
                    "20px",
                    {
                        lineHeight: "28px",
                        fontWeight: "600"
                    }
                ],
                "headline-md": [
                    "24px",
                    {
                        lineHeight: "32px",
                        fontWeight: "600"
                    }
                ],
                "body-md": [
                    "14px",
                    {
                        lineHeight: "20px",
                        fontWeight: "400"
                    }
                ],
                "headline-md-mobile": [
                    "22px",
                    {
                        lineHeight: "28px",
                        fontWeight: "600"
                    }
                ]
            }
        }
    }
};
