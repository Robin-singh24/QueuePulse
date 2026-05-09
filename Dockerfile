FROM python:3.11 

WORKDIR /app

COPY pyproject.toml uv.lock* ./

RUN pip install uv
RUN uv sync --frozen || uv syn

COPY . .

EXPOSE 8000