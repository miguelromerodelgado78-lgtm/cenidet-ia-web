from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

# Modelo para las Publicaciones (Artículos Científicos)
class Publication(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título")
    abstract = models.TextField(verbose_name="Resumen")
    
    # El usuario que gestiona la publicación (el Doctor logueado)
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Doctor/Autor")
    
    # --- NUEVO: Los autores reales del paper ---
    authors_list = models.TextField(blank=True, null=True, verbose_name="Autores del artículo")
    
    date_published = models.DateField(verbose_name="Fecha de Publicación")
    pdf_file = models.FileField(upload_to='publications/pdfs/', verbose_name="Archivo PDF", null=True, blank=True)
    image = models.ImageField(upload_to='publications/', null=True, blank=True)
    
    external_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Enlace Externo (Directo o Scholar)")
    journal_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Nombre de la Revista/Editorial")
    # CAMPO PARA BORRADO LÓGICO
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    # Nuevo: Para guardar cuántas veces ha sido citado (estilo Scholar)
    citations = models.IntegerField(default=0, verbose_name="Citas")
    
    ai_image_url = models.URLField(max_length=500, blank=True, null=True)
    scholar_id_ref = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    def __str__(self):
        return self.title

# --- OTROS MODELOS PERMANECEN IGUAL ---
class Project(models.Model):
    title = models.CharField(max_length=255, verbose_name="Nombre del Proyecto")
    description = models.TextField(verbose_name="Descripción")
    image = models.ImageField(upload_to='projects/images/', verbose_name="Imagen del Proyecto")
    lead_doctor = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Doctor a cargo")
    is_featured = models.BooleanField(default=False, verbose_name="¿Es destacado?")
    # CAMPO PARA BORRADO LÓGICO
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    def __str__(self):
        return self.title

class Event(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título del Evento")
    description = models.TextField()
    date = models.DateTimeField(verbose_name="Fecha y Hora")
    location = models.CharField(max_length=255, verbose_name="Lugar")

    def __str__(self):
        return self.title

class Student(models.Model):
    CATEGORY_CHOICES = [
        ('phd', 'Estudiante de Doctorado'),
        ('undergrad', 'Estudiante de Pregrado'),
        ('alumni', 'Antiguos Alumnos'),
    ]
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students')
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=500, help_text="Ej: desde primavera de 2025")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    link = models.URLField(blank=True, null=True)
    # CAMPO PARA BORRADO LÓGICO
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class Course(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=255, verbose_name="Nombre de la materia")
    code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Código (ej: IS407)")
    semester = models.CharField(max_length=100, verbose_name="Semestre (ej: Primavera 2025)")
    link = models.URLField(blank=True, null=True, verbose_name="Enlace al curso")
    # CAMPO PARA BORRADO LÓGICO
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    def __str__(self):
        return f"{self.name} - {self.semester}"

class News(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='news')
    date_text = models.CharField(max_length=50)
    content = models.TextField()
    link = models.URLField(blank=True, null=True)
    is_important = models.BooleanField(default=False)
    image = models.ImageField(upload_to='news_pics/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_group_announcement = models.BooleanField(default=False, verbose_name="¿Es comunicado del grupo?")
# CAMPO PARA BORRADO LÓGICO
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    def __str__(self):
        return f"{self.date_text} - {self.doctor.username}"

# --- SECCIÓN DE SEÑALES (CORREGIDA) ---
class Project(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título del Proyecto")
    description = models.TextField(verbose_name="Descripción")
    image = models.ImageField(upload_to='projects/', null=True, blank=True)
    participants = models.TextField(help_text="Nombres de los participantes separados por comas")
    last_updated = models.DateField(null=True, blank=True, verbose_name="Última actualización")
    # CAMPO PARA BORRADO LÓGICO
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    # Quitamos el auto_now_add momentáneamente para la migración o le damos un default
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects_created')
    created_at = models.DateTimeField(default=timezone.now) # Usar default es más seguro aquí

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"
# Importamos el perfil de forma diferida dentro de la función para evitar errores
# --- SECCIÓN DE SEÑALES (COMENTADA PARA EVITAR ERROR DE MEMORIA EN RENDER) ---
# @receiver(post_save, sender='accounts.Profile') 
# def auto_sync_scholar_on_create(sender, instance, created, **kwargs):
#     """
#     Sincroniza automáticamente cuando se vincula un ID de Scholar.
#     """
#     if instance.scholar_id:
#         from publications.views import force_scholar_sync
#         # ... el resto del código ...
#         try:
#             print(f"--- Sincronizando datos para: {instance.scholar_id} ---")
#             force_scholar_sync(request)
#         except Exception as e:
#             print(f"Error en auto-sincronización: {e}")