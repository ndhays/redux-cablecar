import CableCarDispatcher from '../src/cableCarDispatcher'
import CableCarRoute from '../src/cableCarRoute'
const mockProvider = {
    createConsumer: jest.fn((url) => 'fake-consumer-for-' + url),
}

describe('CableCarDispatcher', () => {
    let dispatcher: CableCarDispatcher

    beforeEach(() => {
        dispatcher = new CableCarDispatcher()
    })

    it('stores a default consumer under "default"', () => {
        const mockRoute = new CableCarRoute({
            provider: mockProvider,
        })
        dispatcher.consumerFor(mockRoute)
        expect(dispatcher.consumers).toMatchObject({
            default: 'fake-consumer-for-null',
        })
    })

    it('stores dictionary of routes', () => {
        const mockRoute = new CableCarRoute({
            webSocketURL: 'url',
            provider: mockProvider,
        })
        const mockRoute2 = new CableCarRoute({
            webSocketURL: 'url2',
            provider: mockProvider,
        })
        dispatcher.consumerFor(mockRoute)
        dispatcher.consumerFor(mockRoute2)
        expect(dispatcher.consumers).toMatchObject({
            url: 'fake-consumer-for-url',
            url2: 'fake-consumer-for-url2',
        })
    })

    it('reuses consumers', () => {
        const mockRoute = new CableCarRoute({
            webSocketURL: 'url',
            provider: mockProvider,
        })
        dispatcher.consumerFor(mockRoute)
        dispatcher.consumerFor(mockRoute)
        expect(mockProvider.createConsumer).toHaveBeenCalledTimes(1)
    })

    it('calls createConsumer with ws url', () => {
        const mockRoute = new CableCarRoute({
            webSocketURL: 'url',
            provider: mockProvider,
        })
        dispatcher.consumerFor(mockRoute)
        expect(mockProvider.createConsumer).toHaveBeenCalledWith('url')
    })

    it('calls createConsumer with ws url default', () => {
        const mockRoute = new CableCarRoute({
            provider: mockProvider,
        })
        dispatcher.consumerFor(mockRoute)
        expect(mockProvider.createConsumer).toHaveBeenCalledWith(null)
    })
})
