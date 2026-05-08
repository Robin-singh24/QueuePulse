FROM python:3.11 

WORKDIR /app

COPY . .

RUN pip install uv
RUN uv sync

EXPOSE 8000