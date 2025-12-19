import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Calendar, Download } from "lucide-react"
import { layout, designUtils, components } from "@/lib/design-system"

export function PrivacyPolicyCard() {
  return (
    <Card className={layout.container.cardInner}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-gray-800">Privacy Policy</CardTitle>
        </div>
        <CardDescription className={designUtils.body('base')}>
          How we collect, use, and protect your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: January 15, 2024</span>
        </div>
        
        <p className={designUtils.body('small')}>
          This privacy policy explains how Biznify collects, uses, and protects your personal information. 
          We are committed to transparency and data protection.
        </p>
        
        <div className="flex space-x-2">
          <Button size="sm" className={components.button.primary}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" className={components.button.outline}>
            View Online
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 