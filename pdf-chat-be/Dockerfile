FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-venv \
    python3.10-dev \
    build-essential \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./requirements.txt requirements.txt

RUN python3.10 -m venv /venv
ENV PATH="/venv/bin:$PATH"

RUN pip install --upgrade pip \
    && pip install -r requirements.txt


FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3.10 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY --from=builder /venv /venv
COPY . .

RUN useradd -m appuser
USER appuser

EXPOSE 8080

ENTRYPOINT [ "/venv/bin/python" ]
CMD [ "rest_server.py" ]
