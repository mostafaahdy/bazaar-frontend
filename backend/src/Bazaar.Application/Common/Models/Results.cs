using System;
using System.Collections.Generic;

namespace Bazaar.Application.Common.Models;

public class Result<T>
{
    public bool Succeeded { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();

    public static Result<T> Success(T data, string? message = null) =>
        new() { Succeeded = true, Data = data, Message = message };

    public static Result<T> Failure(string error) =>
        new() { Succeeded = false, Errors = new List<string> { error } };

    public static Result<T> Failure(List<string> errors) =>
        new() { Succeeded = false, Errors = errors };
}

public class Result
{
    public bool Succeeded { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();

    public static Result Success(string? message = null) =>
        new() { Succeeded = true, Message = message };

    public static Result Failure(string error) =>
        new() { Succeeded = false, Errors = new List<string> { error } };

    public static Result Failure(List<string> errors) =>
        new() { Succeeded = false, Errors = errors };
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = new List<T>();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedResult() { }

    public PagedResult(IReadOnlyList<T> items, int count, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = count;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}

