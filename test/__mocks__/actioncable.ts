let channelFns = {
    initialized: () => {},
    connected: () => {},
    disconnected: () => {},
    received: () => {},
    rejected: () => {},
}

export const mockChannels = {}

export const mockPerform = jest.fn()
export const mockSend = jest.fn()
export const mockUnsubscribe = jest.fn()

export const mockCreate = jest.fn((opts, callbacks) => {
    mockChannels[opts.channel] = { ...channelFns, ...callbacks }
    return {
        perform: mockPerform,
        send: mockSend,
        unsubscribe: mockUnsubscribe,
    }
})

export const mockCreateConsumer = jest.fn(() => ({
    subscriptions: { create: mockCreate },
}))

export default {
    createConsumer: mockCreateConsumer,
}
