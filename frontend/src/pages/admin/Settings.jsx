import { Card, CardBody, CardHeader, Divider, Tabs, Tab, Input, Button, Switch, Textarea, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';

export const Settings = () => {
  const [selectedTab, setSelectedTab] = useState("profile");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-default-500">Manage your account settings and preferences.</p>
      </div>
      
      <Card>
        <CardBody className="p-0">
          <Tabs 
            aria-label="Settings tabs" 
            selectedKey={selectedTab} 
            onSelectionChange={setSelectedTab}
            className="w-full"
          >
            <Tab 
              key="profile" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" width={18} height={18} />
                  <span>Profile</span>
                </div>
              }
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Enter your first name"
                    defaultValue="Admin"
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter your last name"
                    defaultValue="User"
                  />
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    defaultValue="admin@example.com"
                    type="email"
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    defaultValue="+1 (555) 123-4567"
                  />
                  <Textarea
                    label="Bio"
                    placeholder="Tell us about yourself"
                    className="md:col-span-2"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="flat">Cancel</Button>
                  <Button color="primary">Save Changes</Button>
                </div>
              </div>
            </Tab>
            <Tab 
              key="security" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:shield" width={18} height={18} />
                  <span>Security</span>
                </div>
              }
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    placeholder="Enter your current password"
                    type="password"
                  />
                  <Input
                    label="New Password"
                    placeholder="Enter your new password"
                    type="password"
                  />
                  <Input
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    type="password"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="flat">Cancel</Button>
                  <Button color="primary">Update Password</Button>
                </div>
                
                <Divider className="my-6" />
                
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-default-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Tab>
            <Tab 
              key="notifications" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:bell" width={18} height={18} />
                  <span>Notifications</span>
                </div>
              }
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-default-500">Receive emails about your account activity</p>
                    </div>
                    <Switch defaultSelected />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-default-500">Receive updates on your order status</p>
                    </div>
                    <Switch defaultSelected />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-default-500">Receive marketing emails and promotions</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Product Announcements</p>
                      <p className="text-sm text-default-500">Be the first to know about new products</p>
                    </div>
                    <Switch defaultSelected />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="flat">Cancel</Button>
                  <Button color="primary">Save Preferences</Button>
                </div>
              </div>
            </Tab>
            <Tab 
              key="appearance" 
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:palette" width={18} height={18} />
                  <span>Appearance</span>
                </div>
              }
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-default-500">Toggle between light and dark mode</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Accent Color</p>
                    <div className="grid grid-cols-5 gap-2">
                      {["primary", "secondary", "success", "warning", "danger"].map((color) => (
                        <div 
                          key={color}
                          className={`w-full aspect-square rounded-md bg-${color} cursor-pointer border-2 border-transparent hover:opacity-80 ${color === 'primary' ? 'border-foreground' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Font Size</p>
                    <Select 
                      defaultSelectedKeys={["medium"]}
                      className="max-w-xs"
                    >
                      <SelectItem key="small" value="small">Small</SelectItem>
                      <SelectItem key="medium" value="medium">Medium</SelectItem>
                      <SelectItem key="large" value="large">Large</SelectItem>
                    </Select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="flat">Reset to Default</Button>
                  <Button color="primary">Save Settings</Button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};