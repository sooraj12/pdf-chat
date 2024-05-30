FROM python:3.11-alpine AS builder

WORKDIR /app

COPY ./requirements.txt requirements.txt

RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

FROM python:3.11-alpine

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY --from=builder /venv /venv
COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

EXPOSE 8080

# Set the entrypoint and command to run the app
ENTRYPOINT [ "/venv/bin/python" ]
CMD [ "rest_server.py" ]
