using System;

namespace Bazaar.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
    public DomainException(string message, Exception innerException) : base(message, innerException) { }
}

public class EntityNotFoundException : DomainException
{
    public EntityNotFoundException(string entityName, object key)
        : base($"Entity '{entityName}' with key '{key}' was not found.") { }
}

public class InsufficientStockException : DomainException
{
    public InsufficientStockException(string productName, int requested, int available)
        : base($"Insufficient stock for '{productName}'. Requested: {requested}, Available: {available}.") { }
}

