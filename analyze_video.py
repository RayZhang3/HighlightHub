import boto3
import google.cloud.storage
from google.cloud import videointelligence
import json
import os
from google.oauth2 import service_account

def lambda_handler(event, context):
    # 从事件中获取S3桶名称和对象键
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    object_key = event['Records'][0]['s3']['object']['key']

    # 创建S3客户端
    s3_client = boto3.client('s3')

    # 下载S3对象到本地
    local_file_path = '/tmp/' + object_key.split('/')[-1]  # 保证本地文件名没有路径分隔符
    s3_client.download_file(bucket_name, object_key, local_file_path)

    # credentials for GCS
    credentials_info = json.loads(os.environ['GCP_CREDENTIALS_JSON'])
    credentials = service_account.Credentials.from_service_account_info(credentials_info)
    storage_client = google.cloud.storage.Client(credentials=credentials)

    # 指定Google Cloud Storage桶名称
    gcs_bucket_name = 'myhighlighthub'
    gcs_bucket = storage_client.bucket(gcs_bucket_name)
    gcs_file_path = 'videos/' + object_key.split('/')[-1]  # 构建 GCS 中的存储路径
    gcs_uri = f'gs://{gcs_bucket_name}/{gcs_file_path}'
    # 输出结果的 GCS 路径
    output_path = f'output/{object_key.split("/")[-1]}.json'
    output_uri = f'gs://{gcs_bucket_name}/{output_path}'
    
    # 上传文件到Google Cloud Storage
    blob = gcs_bucket.blob(object_key)
    blob.upload_from_filename(local_file_path)

    # 初始化Google Video Intelligence客户端
    video_client = videointelligence.VideoIntelligenceServiceClient(credentials=credentials)

    # 构建视频分析请求
    features = [
        #videointelligence.Feature.OBJECT_TRACKING,
        videointelligence.Feature.LABEL_DETECTION,
        videointelligence.Feature.SHOT_CHANGE_DETECTION,
        videointelligence.Feature.SPEECH_TRANSCRIPTION,
        #videointelligence.Feature.LOGO_RECOGNITION,
        #videointelligence.Feature.EXPLICIT_CONTENT_DETECTION,
        videointelligence.Feature.TEXT_DETECTION,
        #videointelligence.Feature.FACE_DETECTION,
        #videointelligence.Feature.PERSON_DETECTION
    ]
    transcript_config = videointelligence.SpeechTranscriptionConfig(
        language_code="en-US", enable_automatic_punctuation=True
    )
    
    video_context = videointelligence.VideoContext(
        speech_transcription_config=transcript_config,
    )
    
    
    # 发送视频分析请求
    operation = video_client.annotate_video(
        request={"features": features,
                 "input_uri": gcs_uri,
                 "output_uri": output_uri,
                 "video_context": video_context}
    )
    response = operation.result()

    
    # 从 GCS 下载分析结果
    gcs_output_blob = gcs_bucket.blob(output_path)
    gcs_output_blob.download_to_filename('/tmp/output.json')

    # 将分析结果上传到 S3
    s3_output_bucket = 'highlighthub'
    s3_output_key = f'output/{object_key.split("/")[-1]}.json'
    s3_client.upload_file('/tmp/output.json', s3_output_bucket, s3_output_key)

    return {
        'statusCode': 200,
        'body': f'gs://{gcs_bucket_name}/{output_path}'
    }