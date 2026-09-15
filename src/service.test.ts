import returnTwo from "./service"

describe('service', () => {
    it('should return 2', () => {
        // Arrange
        const input: string = "Test string"
        const expectedResult = 2

        // Act
        const result = returnTwo(input)

        // Assert
        expect(result).toBe(expectedResult)
    })
})