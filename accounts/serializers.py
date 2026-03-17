from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from publications.serializers import PublicationSerializer # Ajusta la ruta si es necesario

# accounts/serializers.py

class UserCreateSerializer(serializers.ModelSerializer):
    # Definimos el campo para recibirlo desde React
    can_post_as_group = serializers.BooleanField(write_only=True, required=False, default=False)
    # Definimos el campo para mostrarlo en la tabla (GET)
    current_group_permission = serializers.BooleanField(source='profile.can_post_as_group', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_staff', 'can_post_as_group', 'current_group_permission']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # 1. Extraemos el permiso de grupo antes de crear al usuario
        can_post_group = validated_data.pop('can_post_as_group', False)

        # 2. Creamos el usuario base
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_staff=validated_data.get('is_staff', False)
        )

        # 3. Buscamos el perfil (que se crea por el Signal) y le asignamos el permiso
        # Nota: Si no usas Signals, puedes usar Profile.objects.create(user=user, ...)
        profile = user.profile
        profile.can_post_as_group = can_post_group
        profile.save()

        return user
# En accounts/serializers.py

# accounts/serializers.py

class PublicDoctorSerializer(serializers.ModelSerializer):
    # Traemos los campos del perfil
    scholar_id = serializers.CharField(source='profile.scholar_id', read_only=True)
    bio = serializers.CharField(source='profile.bio', read_only=True)
    affiliation = serializers.CharField(source='profile.affiliation', read_only=True)
    github_url = serializers.URLField(source='profile.github_url', read_only=True)
    linkedin_url = serializers.URLField(source='profile.linkedin_url', read_only=True)
    image_url = serializers.SerializerMethodField()

    # ESTO ES LO QUE TE FALTA EN EL JSON:
    # Usamos 'publication_set' porque es el nombre que Django da por defecto 
    # a la relación inversa del modelo User hacia Publication
    publications = PublicationSerializer(source='publication_set', many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 
            'scholar_id', 'image_url', 'bio', 'affiliation', 
            'github_url', 'linkedin_url',
            'publications' # <--- DEBE ESTAR EN LA LISTA
        ]

    def get_image_url(self, obj):
        if obj.profile.image:
            return f"http://localhost:8000{obj.profile.image.url}"
        return None
    
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data['user_id'] = self.user.id # <--- ASEGÚRATE DE AGREGAR EL ID AQUÍ TAMBIÉN
        data['username'] = self.user.username
        data['is_staff'] = self.user.is_staff
        data['is_superuser'] = self.user.is_superuser

        # CAMBIA EL NOMBRE AQUÍ PARA QUE COINCIDA CON REACT
        try:
            data['has_group_access'] = self.user.profile.can_post_as_group
        except:
            data['has_group_access'] = False

        try:
            data['scholar_id'] = self.user.profile.scholar_id
        except:
            data['scholar_id'] = ""

        return data