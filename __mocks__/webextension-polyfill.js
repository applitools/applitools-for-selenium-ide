export default {
  runtime: {
    sendMessage: jest.fn().mockReturnValue(Promise.resolve()),
  },
}
