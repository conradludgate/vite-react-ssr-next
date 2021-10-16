module.exports = async () => {
    return {
        paths: [
            { params: { id: "baz" } },
        ],
        fallback: false,
    }
}
