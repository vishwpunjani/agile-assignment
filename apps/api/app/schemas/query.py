from typing import Literal

from pydantic import BaseModel, Field


class QueryChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class QueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=25)
    history: list[QueryChatTurn] = Field(default_factory=list)


class QueryResponse(BaseModel):
    answer: str
    sources: list[str] = Field(default_factory=list)
