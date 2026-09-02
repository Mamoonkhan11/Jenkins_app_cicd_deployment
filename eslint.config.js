module.exports = [
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                require: "readonly",
                module: "readonly",
                process: "readonly",
                lucide: "readonly"
            }
        },
        rules: {
            "no-undef": "warn",
            "no-unused-vars": "warn",
            "no-console": "off"
        }
    }
];