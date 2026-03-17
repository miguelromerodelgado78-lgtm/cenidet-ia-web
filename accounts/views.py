from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.forms import ValidationError
from django.contrib.auth.models import User
from .serializers import UserCreateSerializer, PublicDoctorSerializer
from .models import Profile

# 1. LOGIN (Con info de Staff para el Frontend)
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        email = user.email

        if not email.endswith('@cenidet.tecnm.mx'):
            raise ValidationError("Solo se permiten correos @cenidet.tecnm.mx")

        data['username'] = user.username
        data['email'] = user.email
        data['is_staff'] = user.is_staff # Crucial para el Dr. Prueba
        data['is_superuser'] = user.is_superuser
        try:
            # Si el admin no tiene perfil, evitamos que truene el login
            data['scholar_id'] = user.profile.scholar_id or ""
            data['can_post_as_group'] = user.profile.can_post_as_group
        except:
            data['scholar_id'] = ""
            
        return data

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# 2. REGISTRO DE DOCTORES (Solo Dr. Prueba / Staff)
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminUser] 

    def perform_create(self, serializer):
        email = self.request.data.get('email')
        if not email.endswith('@cenidet.tecnm.mx'):
            from rest_framework.exceptions import ValidationError as DRFValidationError
            raise DRFValidationError({"email": "El correo debe ser institucional"})
        serializer.save()

# 3. LISTADO Y GESTIÓN DE DOCTORES (Solo para el botón "Doctores" del Admin)
class UserViewSet(viewsets.ModelViewSet):
    """
    Esta vista permite al Dr. Prueba ver la lista, 
    editar cualquier doctor o eliminarlos.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminUser] # <--- Bloqueo de seguridad

# 4. VISTA PÚBLICA (NUESTRO EQUIPO)
class PublicProfileViewSet(viewsets.ReadOnlyModelViewSet):
    # Solo mostramos a quienes tengan ID de Scholar (Doctores activos)
    queryset = User.objects.filter(profile__scholar_id__isnull=False).exclude(profile__scholar_id="")
    serializer_class = PublicDoctorSerializer
    permission_classes = [AllowAny]
    
# --- GESTIÓN DE FOTO ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile_photo(request):
    try:
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)

        if 'image' not in request.FILES:
            return Response({"error": "No se envió ninguna imagen."}, status=400)

        profile.image = request.FILES['image']
        profile.save()

        return Response({
            "message": "Foto actualizada",
            "image_url": profile.image.url 
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# 5. GESTIÓN DE PERFIL PERSONAL
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def manage_profile(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    if request.method == 'POST':
        # El Admin puede actualizar su Bio pero no está obligado a tener Scholar ID
        profile.bio = request.data.get('bio', profile.bio)
        profile.office_location = request.data.get('office_location', profile.office_location)
        profile.phone = request.data.get('phone', profile.phone)
        profile.scholar_id = request.data.get('scholar_id', profile.scholar_id)
        profile.github_url = request.data.get('github_url', profile.github_url)
        profile.linkedin_url = request.data.get('linkedin_url', profile.linkedin_url)
        profile.save()
        return Response({"message": "Perfil actualizado", "scholar_id": profile.scholar_id})

    return Response({
        "bio": profile.bio or "",
        "can_post_as_group": profile.can_post_as_group, # <--- Agregar esto
        "office_location": profile.office_location or "",
        "phone": profile.phone or "",
        "scholar_id": profile.scholar_id or "",
        "github_url": profile.github_url or "",
        "linkedin_url": profile.linkedin_url or "",
        "email": user.email
    })
    
    
@api_view(['PATCH'])
@permission_classes([IsAdminUser]) # Solo el Staff (Dr. Prueba) puede usar esto
def toggle_group_permission(request, user_id):
    """
    Cambia el estado del permiso de publicación grupal para un usuario específico.
    """
    try:
        profile = Profile.objects.get(user_id=user_id)
        # Cambiamos al valor opuesto (si era True a False y viceversa)
        profile.can_post_as_group = not profile.can_post_as_group
        profile.save()
        
        return Response({
            "status": "success",
            "username": profile.user.username,
            "can_post_as_group": profile.can_post_as_group
        }, status=200)
    except Profile.DoesNotExist:
        return Response({"error": "Perfil no encontrado"}, status=404)