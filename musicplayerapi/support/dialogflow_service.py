import os
from google.cloud import dialogflow_v2 as dialogflow
from django.conf import settings


def detect_intent_texts(project_id, session_id, text, language_code='vi'):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_APPLICATION_CREDENTIALS

    # Tạo client phiên (session client)
    session_client = dialogflow.SessionsClient()

    session = f"projects/{project_id}/agent/sessions/{session_id}"

    # Chuẩn bị TextInput
    text_input = dialogflow.TextInput(text=text, language_code=language_code)

    # Chuẩn bị QueryInput
    query_input = dialogflow.QueryInput(text=text_input)

    # Gửi yêu cầu lên Dialogflow và nhận phản hồi
    response = session_client.detect_intent(
        request={"session": session, "query_input": query_input}
    )

    return response.query_result.fulfillment_text
