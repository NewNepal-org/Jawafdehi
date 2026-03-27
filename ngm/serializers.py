from rest_framework import serializers


class NGMQuerySerializer(serializers.Serializer):
    query = serializers.CharField(max_length=2048)
    timeout = serializers.FloatField(
        required=False, min_value=1, max_value=15, default=15
    )
