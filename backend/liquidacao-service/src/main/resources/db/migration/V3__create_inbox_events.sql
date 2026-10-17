CREATE TABLE inbox_events (
    id UUID PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL UNIQUE,
    aggregate_id VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    consumer_group VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_message_id ON inbox_events(message_id);