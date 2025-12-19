import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Download } from "lucide-react"
import { layout, designUtils, components } from "@/lib/design-system"

export function TermsOfServiceCard() {
  return (
    <Card className={layout.container.cardInner}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-gray-800">Terms of Service</CardTitle>
        </div>
        <CardDescription className={designUtils.body('base')}>
          Our terms and conditions for using Biznify
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: January 15, 2024</span>
        </div>
        
        <p className={designUtils.body('small')}>
          This document outlines the terms and conditions that govern your use of the Biznify platform. 
          It covers user responsibilities, service limitations, and legal obligations.
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