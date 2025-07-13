from django.test import TestCase
from django.db import connections

class DatabaseConnectionTest(TestCase):

    # Make sure postgres connection is secured
    def test_database_connection(self):
        try:
            # Attempt to connect to the database
            connections['default'].ensure_connection()
        except Exception as e:
            self.fail(f"Database connection failed: {e}")

    # # verify if SSL is used: check if you I have the sslinfo extension installed and enabled
    # def test_ssl_connection(self):
    #     with connections['default'].cursor() as cursor:
    #         cursor.execute('select ssl_is_used();')
    #         result = cursor.fetchone()
    #         self.assertTrue(result and result[0], "SSL connection is not active.")


# # Custom validation to ensure fighter_1_id and fighter_2_id refer to existing fighters.
# # This is an alternative to having direct ForeignKey fields here, which can be complex
# # when you only have IDs from JSON and aren't mapping them to Django PKs directly on load.
# def clean(self):
#     super().clean()
#     if not Fighter.objects.filter(fighter_id=self.fighter_1_id).exists():
#         raise ValidationError(
#             _('%(value)s is not a valid fighter_1_id.'),
#             params={'value': self.fighter_1_id},
#             code='invalid_fighter_id'
#         )
#     if not Fighter.objects.filter(fighter_id=self.fighter_2_id).exists():
#         raise ValidationError(
#             _('%(value)s is not a valid fighter_2_id.'),
#             params={'value': self.fighter_2_id},
#             code='invalid_fighter_id'
#         )

#     # Ensure winning_fighter_id is one of the participants
#     if self.winning_fighter_id and \
#         str(self.winning_fighter_id) not in [self.fighter_1_id, self.fighter_2_id]:
#         raise ValidationError(
#             _('Winning fighter %(value)s must be one of the participating fighters.'),
#             params={'value': self.winning_fighter_id},
#             code='invalid_winner'
#         )