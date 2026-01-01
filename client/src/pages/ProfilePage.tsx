import { Alert } from '@/components/Alert';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, changePassword, getCurrentUser } from '@/services/authService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch current user data
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: !!user,
  });

  // Update profile data when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
    } else if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [currentUser, user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (updatedUser) => {
      setProfileSuccess(t('profile.updateSuccess'));
      setProfileError('');
      // Update user in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.name = updatedUser.name;
        userObj.email = updatedUser.email;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      // Refresh user in AuthContext
      await refreshUser();
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(''), 3000);
    },
    onError: (err: unknown) => {
      const e = err as {
        response?: {
          data?: {
            error?: {
              message?: string;
              details?: Array<{ field?: string; message?: string }>;
            };
          };
        };
      };

      const detailsMsg =
        e.response?.data?.error?.details
          ?.map((d) => `${d.field ?? ''}: ${d.message ?? ''}`.trim())
          .filter(Boolean)
          .join('; ') || '';

      const msg =
        detailsMsg ||
        e.response?.data?.error?.message ||
        t('profile.updateError');
      setProfileError(msg);
      setProfileSuccess('');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordSuccess(t('profile.passwordChangeSuccess'));
      setPasswordError('');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    },
    onError: (err: unknown) => {
      const e = err as {
        response?: {
          data?: {
            error?: {
              message?: string;
              details?: Array<{ field?: string; message?: string }>;
            };
          };
        };
      };

      const detailsMsg =
        e.response?.data?.error?.details
          ?.map((d) => `${d.field ?? ''}: ${d.message ?? ''}`.trim())
          .filter(Boolean)
          .join('; ') || '';

      const msg =
        detailsMsg ||
        e.response?.data?.error?.message ||
        t('profile.passwordChangeError');
      setPasswordError(msg);
      setPasswordSuccess('');
    },
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validation
    if (!profileData.name.trim()) {
      setProfileError(t('validation.nameRequired'));
      return;
    }

    if (profileData.name.trim().length < 2) {
      setProfileError(t('validation.nameMinLength'));
      return;
    }

    if (profileData.name.trim().length > 100) {
      setProfileError(t('validation.nameMaxLength'));
      return;
    }

    if (!profileData.email.trim()) {
      setProfileError(t('validation.emailRequired'));
      return;
    }

    // Email validation - check format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email.trim())) {
      setProfileError(t('validation.invalidEmail'));
      return;
    }

    // Only send changed fields
    const changes: { name?: string; email?: string } = {};
    if (profileData.name !== (currentUser?.name || user?.name)) {
      changes.name = profileData.name.trim();
    }
    if (profileData.email !== (currentUser?.email || user?.email)) {
      changes.email = profileData.email.trim().toLowerCase();
    }

    if (Object.keys(changes).length === 0) {
      setProfileError(t('profile.noChanges'));
      return;
    }

    updateProfileMutation.mutate(changes);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError(t('profile.currentPasswordRequired'));
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError(t('validation.passwordRequired'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(t('validation.passwordMinLength'));
      return;
    }

    // Password strength validation - must contain at least 2 of: letters, numbers, symbols
    let criteriaCount = 0;
    if (/[a-zA-Z]/.test(passwordData.newPassword)) criteriaCount++;
    if (/\d/.test(passwordData.newPassword)) criteriaCount++;
    if (/[!@#$%^&*()_+\-=\[\]{};:,.<>?/\\|`~]/.test(passwordData.newPassword)) criteriaCount++;
    
    if (criteriaCount < 2) {
      setPasswordError(t('validation.passwordWeak'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('profile.passwordMismatch'));
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError(t('profile.passwordSame'));
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoadingUser) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('profile.title')}</h1>
            <p className="text-muted-foreground">{t('profile.subtitle')}</p>
          </div>

          <div className="space-y-6">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{t('profile.profileInfo')}</CardTitle>
                    <CardDescription>{t('profile.profileInfoDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {profileError && <Alert type="error" message={profileError} />}
                  {profileSuccess && <Alert type="success" message={profileSuccess} />}

                  <div className="space-y-2">
                    <Label htmlFor="name">{t('auth.name')}</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder={t('profile.namePlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      placeholder={t('profile.emailPlaceholder')}
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="min-w-[120px]"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('profile.saveChanges')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{t('profile.changePassword')}</CardTitle>
                    <CardDescription>{t('profile.changePasswordDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {passwordError && <Alert type="error" message={passwordError} />}
                  {passwordSuccess && <Alert type="success" message={passwordSuccess} />}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder={t('profile.currentPasswordPlaceholder')}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder={t('profile.newPasswordPlaceholder')}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder={t('profile.confirmPasswordPlaceholder')}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="min-w-[120px]"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          {t('profile.changePasswordButton')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

