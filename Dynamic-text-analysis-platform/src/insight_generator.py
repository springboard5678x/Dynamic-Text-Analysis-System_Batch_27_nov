def generate_user_insight(dominant_topic, sentiment):
    sentiment = sentiment.lower()
    topic = dominant_topic.lower()

    if sentiment == "negative":
        return (
            f"Strong negative sentiment detected in the {topic} domain, "
            f"highlighting concerns around {topic}-driven changes."
        )

    elif sentiment == "positive":
        return (
            f"Strong positive sentiment observed in the {topic} domain, "
            f"indicating optimistic developments and growth."
        )

    else:
        return (
            f"Neutral sentiment identified in the {topic} domain, "
            f"suggesting informational or balanced content."
        )
